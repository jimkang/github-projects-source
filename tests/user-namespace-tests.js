/* global window */

var test = require('tape');
var GitHubProjectsSource = require('../index');
var assertNoError = require('assert-no-error');
var queue = require('d3-queue').queue;
var findWhere = require('lodash.findwhere');
var config = require('../test-config');
var defaults = require('lodash.defaults');
var omit = require('lodash.omit');
var getUserCommits = require('get-user-commits');


var baseCtorOpts = {};

if (typeof window === 'object') {
  // Browser mode.
  baseCtorOpts.db = require('level-js');
  baseCtorOpts.request = require('basic-browser-request');
}
else {
  baseCtorOpts.db = require('leveldown');
  baseCtorOpts.request = require('request');
}

var testCases = [
  {
    ctorOpts: defaults(
      {
        githubToken: config.githubTestToken,
        username: 'jimkang',
        userEmail: 'jimkang@gmail.com',
        onNonFatalError: logNonFatalError,
        getUserCommits
      },
      baseCtorOpts    
    ),
    projects: [
      {'name':'array-viewfinder','id':'MDEwOlJlcG9zaXRvcnk0MDM4NjQ5MQ==','pushedAt':'2015-09-11T00:00:30Z','description':'Maintains a view into an array for you, for paging and other uses.','lastCheckedDate':'2017-09-06T04:00:04.886Z'},
      {'name':'brush-viewfinder','id':'MDEwOlJlcG9zaXRvcnk0MTA5NDU3MA==','pushedAt':'2015-11-15T03:03:22Z','description':'An example that establishes a two-way connection between array-viewfinder and a D3 brush control.','lastCheckedDate':'2017-09-06T04:00:04.886Z'}
    ]
  },
  {
    ctorOpts: defaults(
      {
        githubToken: config.githubTestToken,
        username: 'otherguy',
        userEmail: 'otherguy@gmail.com',
        onNonFatalError: logNonFatalError,
        getUserCommits
      },
      baseCtorOpts
    ),
    projects: [
      {'name':'bl.ocks.org','id':'MDEwOlJlcG9zaXRvcnk0ODc3MjYzNA==','pushedAt':'2016-03-29T17:30:30Z','description':'Browser Extensions for bl.ocks.org','lastCheckedDate':'2017-09-07T15:53:30.794Z'},
      {'name':'solar-calculator','id':'MDEwOlJlcG9zaXRvcnkyNjUyMjA1MQ==','pushedAt':'2017-06-09T22:29:33Z','description':'Equations for computing the position of the Sun.','lastCheckedDate':'2017-09-07T15:53:30.794Z'}
    ]
  }
];

// test('Pause', (t) => {window.c = t.end; console.log('After setting breakpoints, type c() to continue.')});

testCases.forEach(runTests);

function runTests(testCase) {
  test('Update db with projects.', projectUpdateTest);
  test(
    'Ensure that streamed projects all correspond with user specified in ctor',
    localProjectStreamTest
  );

  function projectUpdateTest(t) {
    var githubProjectsSource = GitHubProjectsSource(defaults(
      {
        dbName: 'user-namespace-test'
      },
      testCase.ctorOpts
    ));

    var q = queue();
    testCase.projects.forEach(queuePutProject);
    q.awaitAll(closeDb);

    function queuePutProject(project) {
      q.defer(putProject, project);
    }

    function putProject(project, done) {
      githubProjectsSource.putProject(project, checkPutError);    

      function checkPutError(error) {
        assertNoError(t.ok, error, 'No error while putting project.');
        done(error);
      }
    }

    function closeDb() {
      githubProjectsSource.closeDb(t.end);
    }
  }

  function localProjectStreamTest(t) {
    var emittedProjects = [];

    var githubProjectsSource = GitHubProjectsSource(defaults(
      {
        dbName: 'user-namespace-test',
        onProject: collectProject
      },
      testCase.ctorOpts
    ));

    githubProjectsSource.startStream({sources: ['local']}, checkStreamEnd);

    function collectProject(project) {
      emittedProjects.push(project);
    }

    function checkStreamEnd(error) {
      assertNoError(t.ok, error, 'No error while streaming local stuff.');
      t.equal(
        emittedProjects.length,
        testCase.projects.length,
        'Correct number of projects was emitted.'
      );
      testCase.projects.forEach(checkEmittedForProject);
      console.log(emittedProjects);
      githubProjectsSource.closeDb(t.end);
    }

    function checkEmittedForProject(project) {
      var correspondingEmittedProject = findWhere(emittedProjects, {id: project.id});
      t.deepEqual(
        omit(correspondingEmittedProject, 'deeds', 'commits'),
        project,
        'Emitted project is correct.'
      );
    }
  }
}

function logNonFatalError(error) {
  console.error('Non-fatal error:', error);
}
