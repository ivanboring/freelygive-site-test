# Import the local site into a DevPanel application

Hand this to the user. **They** run it in the DevPanel application's **VS Code
terminal**. DevPanel has no import API, and dumps never go through Git, a
container image or the Claude conversation. This is the project-specific short
form of the toolkit's `docs/MANUAL-DATA-IMPORT.md`. Use that guide for
troubleshooting and edge cases.

Before this step, the application is deployed and `check-site.sh` reports
`install_required`. The export comes from
`.agents/skills/devpanel-deploy/scripts/export-site-data.sh`.

## 1. Upload

In the VS Code Explorer, create `.devpanel-export/` in the application root
(`/var/www/html`). Drag `db.sql.gz`, `files.tgz` and `SHA256SUMS` from the local
project's `.devpanel-export/` folder into it. The folder is git-ignored by the
project's `.gitignore` and sits outside the web root, so nothing in it is
served.

```bash
cd "$APP_ROOT"                                    # /var/www/html
git check-ignore -q .devpanel-export/db.sql.gz && echo ignored   # must print: ignored
(cd .devpanel-export && sha256sum -c SHA256SUMS)  # both: OK
```

## 2. Database

```bash
drush sql:query 'SHOW TABLES' | wc -l             # 0 or 1 = empty, safe to import
gunzip -c .devpanel-export/db.sql.gz | drush sql:cli
```

If the database is not empty, stop and ask Claude. Replacing the data means a
backup plan first (`devpanel_plan_backup_application`), then `drush sql:drop -y`.

## 3. Files

```bash
FILES_DIR="$WEB_ROOT/sites/default/files"
mkdir -p "$FILES_DIR"
tar -xzf .devpanel-export/files.tgz -C "$FILES_DIR"
sudo chown -R "${APACHE_RUN_USER:-www-data}:${APACHE_RUN_GROUP:-www-data}" "$FILES_DIR"
sudo chmod -R 2775 "$FILES_DIR"
```

## 4. OAuth keys

Simple OAuth signs tokens for the Canvas CLI and the site's `/mcp` endpoint. Its
keys are deliberately not in Git (`/keys/` is ignored), and the imported config
expects them at `/var/www/html/keys/`.

```bash
mkdir -p "$APP_ROOT/keys"
drush simple-oauth:generate-keys "$APP_ROOT/keys"
drush config:get simple_oauth.settings public_key   # must be the path above
```

If the application root is not `/var/www/html`, point the config at the new
path. Use `drush config:set simple_oauth.settings public_key "$APP_ROOT/keys/public.key" -y`,
and do the same for `private_key`. If token requests later fail with a key
permission error, `chown` the keys to the web server user and keep mode 600.

## 5. Update, check, clean up

```bash
drush updb -y
drush cr
drush status --fields=drupal-version,db-status,bootstrap,config-sync
rm -rf .devpanel-export
```

Expected: `Database: Connected` and `Drupal bootstrap: Successful`. Then tell
Claude **"data imported"**. Claude verifies the site and then deletes its local
`.devpanel-export/`.

## If the import fails

| Error | Fix |
|---|---|
| `Unknown command '\-'` on line 1 | The export predates the sandbox-line fix. Re-export with the script |
| `Unknown collation: '…'` | `gunzip -c .devpanel-export/db.sql.gz \| sed 's/<collation>/utf8mb4_unicode_ci/g' \| drush sql:cli` |
| `Table … already exists` | The target was not empty. Stop and ask Claude (see step 2) |
| `No space left on device` | Ask Claude to raise the application storage. It is a plan, and storage can never shrink |
