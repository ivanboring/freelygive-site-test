import { useCallback, useMemo, useState } from 'react';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import useSWR from 'swr';

/** Drupal JSON:API client instance. */
const client = new JsonApiClient();

/** Number of search results displayed per page. */
const ITEMS_PER_PAGE = 10;
/** Map of entity type labels to their JSON:API type identifiers. */
const ENTITY_TYPE_MAP = {
  page: 'canvas_page',
  node: 'node',
};
/** Node content types that support search filtering. */
const CONTENT_TYPE_FIELDS = ['article', 'person'];

/** Fields requested from the API for all entity types. */
const COMMON_FIELDS = ['title', 'path'];

/** A multi-value filter comparison (e.g. an `IN` condition). */
interface FilterValue {
  value: string | string[];
  operator: string;
}

/** A single JSON:API filter condition, keyed by field path. */
interface FilterCondition {
  entity_type: string;
  content_type?: string | FilterValue;
  /** Discriminant marking this as a plain condition rather than an OR group. */
  _or?: undefined;
}

/** An OR group wrapping multiple filter conditions. */
interface OrFilterConfig {
  _or: true;
  conditions: FilterCondition[];
}

/** Either a single filter condition or an OR group of conditions. */
type FilterConfig = FilterCondition | OrFilterConfig;

/** Counts of entity types and content types found in a result set. */
interface FacetCounts {
  entityTypes: Record<string, number>;
  contentTypes: Record<string, number>;
}

/** A single JSON:API search result item. */
interface SearchResultItem {
  id?: string;
  type: string;
  attributes?: {
    title?: string;
    path?: { alias?: string };
  };
}

/** A JSON:API pagination link. */
interface PaginationLink {
  href?: string;
}

/** Pagination links returned alongside a search result set. */
interface SearchLinks {
  first?: PaginationLink;
  prev?: PaginationLink;
  next?: PaginationLink;
  last?: PaginationLink;
}

/** The subset of the search response the UI consumes. */
interface SearchData {
  data: SearchResultItem[];
  links: SearchLinks;
}

// ============= Helper Functions =============

/** Read the `q` search parameter from the current URL. */
function getSearchQuery(): string {
  if (typeof window === 'undefined') return '';
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('q') || '';
}

/** Add sparse fieldset for all searchable entity types. */
function addFieldsForAllTypes(
  params: DrupalJsonApiParams,
  fields: string[],
): DrupalJsonApiParams {
  params.addFields('page', fields);
  CONTENT_TYPE_FIELDS.forEach((contentType) => {
    params.addFields(`node--${contentType}`, fields);
  });
  return params;
}

/** Build a filter configuration object from selected entity/content types. */
function buildFilterConfig(
  selectedEntityTypes: string[],
  selectedContentTypes: string[],
): FilterConfig | null {
  if (selectedEntityTypes.length === 0 && selectedContentTypes.length === 0) {
    return null;
  }

  const conditions: FilterCondition[] = [];

  if (selectedEntityTypes.includes('page')) {
    conditions.push({ entity_type: ENTITY_TYPE_MAP.page });
  }

  if (selectedContentTypes.length > 0) {
    conditions.push({
      entity_type: ENTITY_TYPE_MAP.node,
      content_type:
        selectedContentTypes.length === 1
          ? selectedContentTypes[0]
          : { value: selectedContentTypes, operator: 'IN' },
    });
  } else if (selectedEntityTypes.includes('node')) {
    conditions.push({ entity_type: ENTITY_TYPE_MAP.node });
  }

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];

  return { _or: true, conditions };
}

/** Build the full search query string including pagination and filters. */
function buildSearchQuery(
  searchQuery: string,
  filterConfig: FilterConfig | null,
  pageOffset: number,
): string {
  const params = new DrupalJsonApiParams()
    .addPageLimit(ITEMS_PER_PAGE)
    .addPageOffset(pageOffset);

  addFieldsForAllTypes(params, COMMON_FIELDS);

  if (searchQuery) {
    params.addFilter('fulltext', searchQuery);
  }

  let queryString = params.getQueryString();

  if (filterConfig) {
    const filterParams: string[] = [];

    if ('conditions' in filterConfig) {
      filterConfig.conditions.forEach((condition, index) => {
        (Object.entries(condition) as [string, string | FilterValue][]).forEach(
          ([key, value]) => {
            const groupId = `condition_${index}`;
            filterParams.push(`filter[${groupId}][condition][path]=${key}`);

            if (typeof value === 'object' && value.operator) {
              filterParams.push(
                `filter[${groupId}][condition][operator]=${value.operator}`,
              );
              const values = Array.isArray(value.value)
                ? value.value
                : [value.value];
              values.forEach((v, vIndex) => {
                filterParams.push(
                  `filter[${groupId}][condition][value][${vIndex}]=${v}`,
                );
              });
            } else {
              filterParams.push(
                `filter[${groupId}][condition][value]=${value}`,
              );
            }

            filterParams.push(
              `filter[${groupId}][condition][memberOf]=or_group`,
            );
          },
        );
      });
      filterParams.push(`filter[or_group][group][conjunction]=OR`);
    } else {
      (
        Object.entries(filterConfig) as [string, string | FilterValue][]
      ).forEach(([key, value]) => {
        filterParams.push(`filter[${key}][condition][path]=${key}`);

        if (typeof value === 'object' && value.operator) {
          filterParams.push(
            `filter[${key}][condition][operator]=${value.operator}`,
          );
          const values = Array.isArray(value.value)
            ? value.value
            : [value.value];
          values.forEach((v, vIndex) => {
            filterParams.push(
              `filter[${key}][condition][value][${vIndex}]=${v}`,
            );
          });
        } else {
          filterParams.push(`filter[${key}][condition][value]=${value}`);
        }
      });
    }

    if (filterParams.length > 0) {
      queryString += '&' + filterParams.join('&');
    }
  }

  return queryString;
}

/** Build a query string for fetching facet counts (type field only). */
function buildFacetQuery(searchQuery: string): string {
  const params = new DrupalJsonApiParams();
  addFieldsForAllTypes(params, ['type']);

  if (searchQuery) {
    params.addFilter('fulltext', searchQuery);
  }

  return params.getQueryString();
}

/** Count entity type and content type occurrences in search results. */
function calculateFacets(data: SearchResultItem[] | undefined): FacetCounts {
  if (!data?.length) {
    return {
      entityTypes: {},
      contentTypes: {},
    };
  }

  const entityTypeCounts: Record<string, number> = {};
  const contentTypeCounts: Record<string, number> = {};

  data.forEach((item) => {
    const [entityType, contentType] = item.type.split('--');
    entityTypeCounts[entityType] = (entityTypeCounts[entityType] || 0) + 1;

    if (entityType === 'node' && contentType) {
      contentTypeCounts[contentType] =
        (contentTypeCounts[contentType] || 0) + 1;
    }
  });

  return { entityTypes: entityTypeCounts, contentTypes: contentTypeCounts };
}

/** Count facets filtered by selected content types. */
function calculateFilteredFacets(
  data: SearchResultItem[] | undefined,
  selectedContentTypes: string[],
): FacetCounts {
  if (!data?.length) {
    return {
      entityTypes: {},
      contentTypes: {},
    };
  }

  const entityTypeCounts: Record<string, number> = {};
  const contentTypeCounts: Record<string, number> = {};

  data.forEach((item) => {
    const [entityType, contentType] = item.type.split('--');

    // If content types are selected, only count matching items
    if (selectedContentTypes.length > 0) {
      if (entityType === 'page') {
        entityTypeCounts[entityType] = (entityTypeCounts[entityType] || 0) + 1;
      } else if (
        entityType === 'node' &&
        contentType &&
        selectedContentTypes.includes(contentType)
      ) {
        entityTypeCounts[entityType] = (entityTypeCounts[entityType] || 0) + 1;
        contentTypeCounts[contentType] =
          (contentTypeCounts[contentType] || 0) + 1;
      }
    } else {
      entityTypeCounts[entityType] = (entityTypeCounts[entityType] || 0) + 1;
      if (entityType === 'node' && contentType) {
        contentTypeCounts[contentType] =
          (contentTypeCounts[contentType] || 0) + 1;
      }
    }
  });

  return { entityTypes: entityTypeCounts, contentTypes: contentTypeCounts };
}

/** Extract the page offset from a JSON:API pagination link. */
function extractOffsetFromLink(
  link: PaginationLink | undefined,
): number | null {
  if (!link?.href) return null;

  try {
    const url = new URL(link.href);
    const offset = url.searchParams.get('page[offset]');
    return offset ? Math.max(0, parseInt(offset, 10)) : null;
  } catch {
    return null;
  }
}

/**
 * Full-page search results with entity type and content type faceted filtering.
 * Fetches results from the Drupal JSON:API search index with pagination.
 */
export default function SearchWithFacets() {
  const searchQuery = useMemo(() => getSearchQuery(), []);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(
    [],
  );
  const [pageOffset, setPageOffset] = useState(0);

  const filterConfig = useMemo(
    () => buildFilterConfig(selectedEntityTypes, selectedContentTypes),
    [selectedEntityTypes, selectedContentTypes],
  );

  const facetQueryString = useMemo(
    () => buildFacetQuery(searchQuery),
    [searchQuery],
  );

  const searchQueryString = useMemo(
    () => buildSearchQuery(searchQuery, filterConfig, pageOffset),
    [searchQuery, filterConfig, pageOffset],
  );

  const { data: facetData } = useSWR<SearchResultItem[]>(
    ['index--cms_content', facetQueryString],
    ([type, query]: [string, string]) =>
      client.getCollection(type, {
        queryString: query,
      }) as Promise<SearchResultItem[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const {
    data: searchData,
    error,
    isLoading,
  } = useSWR<SearchData>(
    ['index--cms_content', searchQueryString],
    async () => {
      const response = await fetch(
        `/api/index/cms_content?${searchQueryString}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const searchResponse = await response.json();
      // Return only data and links
      return {
        data: searchResponse.data,
        links: searchResponse.links,
      };
    },
    { revalidateOnFocus: false },
  );

  // Calculate facets from unfiltered facet data
  const baseFacets = useMemo(() => calculateFacets(facetData), [facetData]);

  // Calculate filtered facets when content types are selected
  const facets = useMemo(
    () => calculateFilteredFacets(facetData, selectedContentTypes),
    [facetData, selectedContentTypes],
  );

  // Get items from search results
  const items: SearchResultItem[] = searchData?.data || [];
  const links: SearchLinks = searchData?.links || {};

  const toggleEntityType = useCallback((type: string) => {
    setSelectedEntityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    if (type === 'page') {
      setSelectedContentTypes([]); // Reset content type filters when Canvas Page is selected
    }
    setPageOffset(0);
  }, []);

  const toggleContentType = useCallback((type: string) => {
    setSelectedContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setPageOffset(0);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedEntityTypes([]);
    setSelectedContentTypes([]);
    setPageOffset(0);
  }, []);

  const handlePageChange = useCallback((link: PaginationLink | undefined) => {
    const offset = extractOffsetFromLink(link);
    if (offset !== null) {
      setPageOffset(offset);
    }
  }, []);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">
          An error occurred while loading search results.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#2563EB]"></div>
        <p className="mt-2 text-[#6B7280]">Loading results...</p>
      </div>
    );
  }

  const hasFilters =
    selectedEntityTypes.length > 0 || selectedContentTypes.length > 0;

  return (
    <div className="flex gap-6">
      {Object.keys(facets.entityTypes).length > 0 && (
        <aside className="search-facets w-64 flex-shrink-0">
          <div className="sticky top-4 rounded-lg border border-[#E5E7EB] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#111827]">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-6">
              <h4 className="mb-4 text-sm font-semibold text-[#374151]">
                Entity Type
              </h4>
              {Object.entries(facets.entityTypes).map(([type, count]) => (
                <label
                  key={type}
                  className="mb-2 flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-[#F9FAFB]"
                >
                  <input
                    type="checkbox"
                    checked={selectedEntityTypes.includes(type)}
                    onChange={() => toggleEntityType(type)}
                    className="h-4 w-4 rounded text-[#2563EB]"
                  />
                  <span className="flex-1 text-sm text-[#374151]">
                    {type === 'node'
                      ? 'Content'
                      : type === 'page'
                        ? 'Canvas Page'
                        : type}
                  </span>
                  <span className="text-xs font-medium text-[#9CA3AF]">
                    ({count})
                  </span>
                </label>
              ))}
            </div>

            {Object.keys(baseFacets.contentTypes).length > 0 &&
              !selectedEntityTypes.includes('page') && (
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-[#374151]">
                    Content Type
                  </h4>
                  {Object.entries(baseFacets.contentTypes).map(
                    ([type, count]) => (
                      <label
                        key={type}
                        className="mb-2 flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-[#F9FAFB]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContentTypes.includes(type)}
                          onChange={() => toggleContentType(type)}
                          className="h-4 w-4 rounded text-[#2563EB]"
                        />
                        <span className="flex-1 text-sm text-[#374151] capitalize">
                          {type}
                        </span>
                        <span className="text-xs font-medium text-[#9CA3AF]">
                          ({count})
                        </span>
                      </label>
                    ),
                  )}
                </div>
              )}
          </div>
        </aside>
      )}

      <main className="search-results min-w-0 flex-1">
        <h2 className="mb-4 text-2xl font-bold">Search Results</h2>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-2 text-[#6B7280]">No results found.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#2563EB] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li
                  key={item.id || index}
                  className="border-b border-[#E5E7EB] py-3"
                >
                  <h3 className="font-semibold text-[#2563EB] hover:underline">
                    <a href={item.attributes?.path?.alias || '#'}>
                      {item.attributes?.title}
                    </a>
                  </h3>
                </li>
              ))}
            </ul>

            {links && (
              <div className="search-pagination mt-6 flex gap-2">
                {links.first && (
                  <button
                    onClick={() => handlePageChange(links.first)}
                    className="flex items-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
                  >
                    First
                  </button>
                )}
                {links.prev && (
                  <button
                    onClick={() => handlePageChange(links.prev)}
                    className="flex items-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
                  >
                    <svg
                      className="mr-1"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M10 12L6 8L10 4"
                        stroke="#4B5563"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Previous
                  </button>
                )}
                {links.next && (
                  <button
                    onClick={() => handlePageChange(links.next)}
                    className="flex items-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
                  >
                    Next
                    <svg
                      className="ml-1"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="#4B5563"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                {links.last && (
                  <button
                    onClick={() => handlePageChange(links.last)}
                    className="flex items-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
                  >
                    Last
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
