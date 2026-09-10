package com.pestcontrol.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest;  
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static org.junit.jupiter.api.Assertions.*;

@RestClientTest(GitHubController.class)
class GithubControllerTest
{
	@Autowired
	private GitHubController githubController;
	
	@Autowired
	private MockRestServiceServer mockServer;

	@Test 
	void testGetCommitHistorySuccess()
	{
		String mockGitHubResponse = "[{\"sha\":\"12345\",\"commit\":{\"message\":\"Initial commit\"}}]";

		mockServer.expect(requestTo("https://api.github.com/repos/octocat/Hello-World/commits"))
				.andExpect(method(HttpMethod.GET))
				.andRespond(withSuccess(mockGitHubResponse, MediaType.APPLICATION_JSON));

		var response = githubController.GetCommitHistory(null, "octocat", "Hello-World");

		assertEquals(200, response.getStatusCode().value());
		assertTrue(response.getBody().contains("Initial commit"));

		mockServer.verify();
	}
}