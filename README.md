# GCP Process Logger

This is a simple wrapper to log the output of a process to GCP Cloud Logging.

Example usage:

```bash
gcp-process-logger my-test-log --label foo=bar --label bar=foo -- npm run build
```

This will run anything after the `--` as the command and pipe the output to the log name passed as the first argument.

Optionally, you can pass one or more labels as `--label key=value` which will be attached to the metadata of the log entry.

To control a non-default GCP project id, use `--project-id=[ID]` to setup the logger to use that id.
