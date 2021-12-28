import { JSDOM } from "jsdom";
import * as core from '@actions/core';
import * as github from "@actions/github";
import fetch from 'node-fetch';


const fetchPullRequest = async (url) => {
    const fetchOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'text/html' },
        credentials: 'include',
      };

    const resp = await fetch(url, fetchOptions);
    if(!resp.ok){
        throw new Error(`Unable to fetch pull request at ${url}`);
    }

    return await resp.text();
}   

try {
    const url = core.getInput('URL');
    // const contextURL = github.context.payload.pull_request?.html_url
    console.log(`URL from input: ${url}`);
    // console.log(`URL from context: ${contextURL}`);

    const html = fetchPullRequest(url);
    console.log
    const { document } = new JSDOM(html).window;
    const issuesForm = document.querySelector("form[aria-label=\"Link issues\"]");
    console.log
    const anchors = issuesForm.querySelectorAll("a")
    const issueURLs = []
    for (let anchor of anchors){
        const issueURL = anchor.getAttribute("href");
        // const issue
        issueURLs.push(issueURL);
    }

    core.setOutput('issueURLs', issueURLs);
}
catch (err) {
    core.setFailed(err);
}