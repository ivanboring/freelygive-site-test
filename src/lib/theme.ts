/**
 * Project-wide theme unions used by multiple components' `.component.yml` prop
 * enums. Components import these instead of redeclaring the same values inline;
 * a component that extends a union (e.g. adds a colour) declares the extension
 * on itself rather than widening the shared type here.
 */
export type TextColor = 'Dark' | 'Light';
export type TextShadow = 'Light' | 'Medium' | 'Heavy';
