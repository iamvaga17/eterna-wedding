WEDLETTER API RELEASE DIRECTORY

This directory contains reviewed source files for manually approved deployment
to the SpaceWeb PHP API folder. It is NOT live and NOT used by the staging
workflow.

Current allowlist: rsvp.php only.

To deploy, a reviewed rsvp.php must first be committed here.
Then use GitHub Actions > WEDLETTER | Deploy single API PHP file >
Run workflow, choose rsvp.php and enter DEPLOY API.

The action checks PHP syntax, downloads the current remote file into
ephemeral runner memory, uploads, checks SHA-256 on readback, and attempts
rollback immediately if upload verification fails. Backups are NOT durable:
for disaster recovery you still need the host backup or an independent
encrypted off-server backup.

Do not commit credentials or private PHP config files.
The FTP user should be jailed to /public_html/api.
