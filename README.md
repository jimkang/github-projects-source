github-projects-source
==================

A read-through cache of per-user GitHub repo and commit data. Uses LevelUp (backed by either LevelJS in the browser or LevelDB on Node) as the store and the GitHub API as the system-of-record.

Installation
------------

    npm install github-projects-source

Usage
-----

First, construct an instance by calling `GitHubProjectsSource` with the opts:

- **githubToken**: The token for the calls to the GitHub API.
- **username**: The username of the GitHub user for which you are getting repos and commits.
- **userEmail**: The email associated with the commits you are getting.
- **request**: An http request function compatible with [github.com/request/request]. [Details about what's compatible.](https://github.com/jimkang/get-user-commits#plug-in-your-own-request-library)
- **onNonFatalError**: A callback that will be passed errors that are encountered that are not critical enough to stop streaming.
- **dbName**: The label for the LevelDB (or LevelDB-like) database that things will be cached in.
- **db**: A [leveldown](https://github.com/Level/levelup/)-compatible database, such as memdown. Tested with `leveldown`. To use this in browsers, [level.js](https://github.com/maxogden/level.js) is recommended.
- **onDeed**: A callback that will be called every time a new commit is received. The term 'deed' is used here so that github-projects-source will be compatible with projects-sources that do not deal with commits or repos.
- **onProject**: A callback that will be called every time a new repo is received.

The constructed instance will have a `startStream(opts, callback)` method, which takes an options object and a callback that is called when either everything can stream as been streamed or a fatal error is encountered. The options object:

- **sources**: An array containing the strings 'local' and/or 'API'. If 'local' is specified, it will stream from the local cache. If 'API' is specified, it will stream from the GitHub API. If both are specified, it will first stream from the local cache, then get the rest from the GitHub API.
- **existingProjects**: Existing repos and their current states. This will let github-projects-source avoid fetching commits that are already among existingProjects.

Example:

    var GitHubProjectsSource = require('github-projects-source');
    var request = require('request');
    var levelup = require('levelup');

    var reposWeAlreadyHaveSomeOfTheCommitsFor = [
      {
        name: 'exogenite',
        commits: [
          {
            committedDate: isoStringForDateString('2017-03-10')
          },
          {
            committedDate: isoStringForDateString('2017-03-13')
          },
          {
            committedDate: isoStringForDateString('2017-03-12')
          }
        ]
      },
      {
        name: 'godtributes',
        commits: [
          {
            committedDate: isoStringForDateString('2014-06-30')
          },
          {
            committedDate: isoStringForDateString('2014-09-22')
          },
          {
            committedDate: isoStringForDateString('2014-10-31')
          }
        ]
      },
      {
        name: 'off-brand-vine',
        commits: [
          {
            committedDate: isoStringForDateString('2017-04-06')
          },
          {
            committedDate: isoStringForDateString('2017-05-06')
          },
          {
            committedDate: isoStringForDateString('2017-04-20')
          }
        ],
        weHaveTheOldestCommit: true
      }
    ];

    var githubProjectsSource = GitHubProjectsSource({
      user: 'jimkang',
      githubToken: 'your GitHub API token',
      username: 'jimkang',
      userEmail: 'jimkang@gmail.com',
      request: request,
      onNonFatalError: logNonFatalError,
      dbName: 'github-deeds',
      level: levelup,
      onDeed: logDeed,
      onProject: logProject
    });

    githubProjectsSource.startStream(
      {
        sources: ['local', 'API'],
        existingProjects: reposWeAlreadyHaveSomeOfTheCommitsFor
      },
      onStreamEnd
    );

    function logNonFatalError(error) {
      console.log('An error happened, but not one that will stop the rest of the commits from getting fetched:', error);
    }

    function logProject(project) {
      console.log(project);
      // project will look like:
      // {
      //   "name": "boxadder",
      //   "id": "MDEwOlJlcG9zaXRvcnk4NDAyMDcy",
      //   "pushedAt": "2013-03-12T18:26:28Z",
      //   "description": "An app that calculates the sums of items in boxes and updates all other client instances about its changes. A test drive of Meteor, svg, and d3.js.",
      //   "lastCheckedDate": "2017-06-18T16:59:05.057Z"
      // }      
    }

    function logDeed(deed) {
      console.log(deed);
      // deed will look like:
      // {
      //   "id": "6812aea",
      //   "message": "Increased the zoom out extent.",
      //   "committedDate": "2013-03-12T18:25:01Z",
      //   "projectName": "boxadder"
      // }      
    }

    function onStreamEnd(error) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('No error while streaming projects and deeds!');
      }
    }

Tests
-----

Tests are run with `make test` and `make test-browser` after you create a `test-config.js` file like this:

    module.exports = {
      githubTestToken: '<Your GitHub token>'
    };

However, [they are currently not easy to run for anyone but myself because it's hard to make test commits accessible to everyone via the GitHub API](https://github.com/jimkang/get-user-commits#tests).

License
-------

The MIT License (MIT)

Copyright (c) 2017 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
