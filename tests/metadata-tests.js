/* global window */

var test = require('tape');
var GitHubProjectsSource = require('../index');
var config = require('../test-config');
var defaults = require('lodash.defaults');
var getUserCommits = require('get-user-commits');

var baseCtorOpts = {};

if (typeof window === 'object') {
  // Browser mode.
  baseCtorOpts.db = require('level-js');
  baseCtorOpts.request = require('basic-browser-request');
} else {
  baseCtorOpts.db = require('leveldown');
  baseCtorOpts.request = require('request');
  baseCtorOpts.userAgent = 'github-projects-source-test';
}

var testCases = [
  {
    name: 'Project with metadata',
    ctorOpts: defaults(
      {
        githubToken: config.githubTestToken,
        username: 'jimkang',
        userEmail: 'jimkang@gmail.com',
        onNonFatalError: logNonFatalError,
        getUserCommits,
        cache: false,
        filterProject: project => project.name === 'mhd',
        onDeed: deed => deed,
        userAgent: 'github-projects-source-test',
        dbName: 'project-with-metadata'
      },
      baseCtorOpts
    ),
    expectedProjectMetaProperties: {
      description: 'A Music Hack Day project that ruined music at random.'
    }
  },
  {
    name: 'Skip metadata',
    ctorOpts: defaults(
      {
        githubToken: config.githubTestToken,
        username: 'jimkang',
        userEmail: 'jimkang@gmail.com',
        onNonFatalError: logNonFatalError,
        getUserCommits,
        cache: false,
        filterProject: project => project.name === 'mhd',
        onDeed: deed => deed,
        userAgent: 'github-projects-source-test',
        dbName: 'skip-metadata',
        skipMetadata: true
      },
      baseCtorOpts
    ),
    expectedProjectMetaProperties: {
      description: 'My Music Hack Day hack.'
    }
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, metadataTest);

  function metadataTest(t) {
    var githubProjectsSource = GitHubProjectsSource(
      defaults(
        {
          onProject: checkProject
        },
        testCase.ctorOpts
      )
    );
    githubProjectsSource.startStream({ sources: ['API'] }, close);

    function checkProject(project) {
      t.ok(project.name, 'Project has a name.');
      t.ok(project.pushedAt, 'Project has a pushedAt date.');
      t.ok(project.lastCheckedDate, 'Project has a lastCheckedDate.');

      for (var prop in testCase.expectedProjectMetaProperties) {
        t.equal(
          project[prop],
          testCase.expectedProjectMetaProperties[prop],
          'Metadata property ' + prop + ' is correct.'
        );
      }
    }

    function close() {
      githubProjectsSource.closeDb(t.end);
    }
  }
}

function logNonFatalError(error) {
  console.error('Non-fatal error:', error);
}
