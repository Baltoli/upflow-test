# PDF Submission Microservice

This repository contains the implementation of a TypeScript microservice that
downloads PDFs from URLs in submitted requests, then stores them in a database
with auto-generated thumbnails.

Documents are hashed when they are downloaded to avoid storing multiple copies
of the same document. Subsequent requests with identical PDFs (even if they come
from different sources) will not result in new documents being stored.

## External Dependencies

The service relies on GhostScript and GraphicsMagick to process PDFs into
images; these are external dependencies that need to be installed through your
system package manager.

From the package documentation [here][gm-deps], you can run (as appropriate):
```
brew update
brew install gs graphicsmagick
```
or
```
sudo apt-get update
sudo apt-get install ghostscript
sudo apt-get install graphicsmagick
```

## Building and Running

The service has been tested using Node version `v15.11.0`. If you use
[nvm][nvm], you can get this version and set it to run locally with:
```
nvm install v15.11.0
nvm use v15.11.0
```

Once Node is installed, `npm install` will install all the Node packages needed
to run the service.

To compile and lint the app:
```
npx tsc
npx eslint src
```

To run the compiled app:
```
node build/index.js
```

The service listens on TCP port 3000 for requests once started.

### API Endpoints

All endpoints send and receive JSON.

* `POST /upload` Accepts an object with two properties:
    * `url`: required; URL pointing to a PDF document
    * `hook`: optional; URL pointing to a webhook interface as described below
* `GET /uploads` Returns a list of objects representing uploaded documented, each
  with two properties:
    * `pdf`: Absolute URL pointing to the uploaded PDF
    * `thumbnail`: Absolute URL pointing to the generated thumbnail
* `GET /uploads/:id/pdf` Returned by `/uploads`; responds with the PDF upload with the
  specified ID.
* `GET /uploads/:id/images` Returned by `/uploads`; responds with the generated
  thumbnail for the upload with the specified ID.

### Webhook Interface

If the `hook` property is passed on submission, a webhook request will be made
relative to the URL it points to after a document is uploaded. The webhook
server should expose the following endpoints:

* `POST /success` Should accept a JSON object in the format returned by a single
  element of a response from `/upload`.
* `POST /error` Should accept a JSON object with a single string property
  (`error`) describing the application error.

## Design Rationale

The biggest conscious design choice made for the service is to store uploaded
and generated files directly in the database rather than the filesystem. This
has a number of advantages:
* Files don't need to be named, and the service has to make fewer assumptions
  about the environment it runs in (i.e. no assumption of a data directory, or
  that files once downloaded will continue to exist on disk).
* Less disk I/O performed for each request. If an in-memory PDF to image
  conversion was available, the entire service could live in-memory.
* Far simpler implementation in a number of places; cleaner code.

Another choice is to deduplicate by hash rather than by URL; doing so means that
if the content at a URL changes, the new content will automatically be
saved. Similarly, if two URLs point to the same content, only one copy would be
saved. This regime does require one download per request made, but this could be
relaxed by adding an invalidating cache (by time, for example) on top of the
hashing-based deduplication.

## Improvements

This service is obviously a minimal example / proof of concept and doesn't
implement every possible improvement. Some of the next steps

* **Tests:** There isn't a great deal of pure business logic in this
  application - almost all the complexity is in plumbing I/O around
  appropriately. This means that there isn't a real opportunity to add
  productive unit tests, although this would likely change with any increased
  application complexity. As implemented, however, the service would definitely
  benefit from integration tests that exercise the entire flow from submission
  to retrieval.
* **Error Handling:** Currently the app bundles any encountered error when
  downloading and processing PDFs into one handler and returns it directly to
  the user. This isn't ideal from a security or UI perspective, so the service
  should more carefully identify possible sources of error and percolate them
  back into responses as appropriate.
* **Security:** The service makes no guarantee of any security properties, and
  there are obvious improvements to be made here (e.g. non-sequential document
  IDs, authentication if the use case requires, denial of service prevention
  when deployed, information / environment leakage).

[gm-deps]: https://github.com/yakovmeister/pdf2image/blob/next/docs/gm-installation.md
[nvm]: https://github.com/nvm-sh/nvm
