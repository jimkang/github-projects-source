/* global Buffer */

var GitHubFile = require('github-file');
var sb = require('standard-bail')();

function getProjectMetadata(
  { gitRepoOwner, gitToken, branchMetadataIsOn = 'master', request },
  done
) {
  var encodeInBase64;
  var decodeFromBase64;
  // Set this if we're in Node. Otherwise, let GitHubFile set them to the
  // browser versions.

  if (typeof window !== 'object' || !window.btoa) {
    encodeInBase64 = function encodeFromBase64(s) {
      return Buffer.from(s, 'utf8').toString('base64');
    };
    decodeFromBase64 = function decodeFromBase64(s) {
      return Buffer.from(s, 'base64').toString('utf8');
    };
  }

  var githubFile = GitHubFile({
    branch: branchMetadataIsOn,
    repo: 'observatory-meta',
    gitRepoOwner,
    gitToken,
    shouldSetUserAgent: encodeInBase64 ? true : false,
    encodeInBase64,
    decodeFromBase64,
    request
  });

  githubFile.get('projects.json', sb(parseMetadata, done));

  function parseMetadata(result) {
    if (result && result.content) {
      done(null, JSON.parse(result.content));
    } else {
      done(
        new Error(
          'Metadata does not exist for ' + gitRepoOwner + '\'s projects.'
        )
      );
    }
  }
}

module.exports = getProjectMetadata;
