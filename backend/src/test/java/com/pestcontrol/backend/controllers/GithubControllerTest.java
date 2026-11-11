package com.pestcontrol.backend.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest; 
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

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
		String mockGitHubResponse = """
				[
					{
						"sha" : "12345",
						"commit" :
							{
								"message" : "Initial commit"
							}
					}
				]
				""";

		mockServer.expect(requestTo("https://api.github.com/repos/octocat/Hello-World/commits?sha=main"))
				.andExpect(method(HttpMethod.GET))
				.andRespond(withSuccess(mockGitHubResponse, MediaType.APPLICATION_JSON));

		var response = githubController.GetCommitHistory(null, "octocat", "Hello-World", "main");

		assertEquals(200, response.getStatusCode().value());
		assertTrue(response.getBody().contains("Initial commit"));

		mockServer.verify();
	}

	@Test
	void testGetCommitHistoryNotFound()
	{
		mockServer.expect(requestTo("https://api.github.com/repos/octocat/Hello-World/commits?sha=invalid-branch"))
				.andExpect(method(HttpMethod.GET))
				.andRespond(withStatus(HttpStatus.NOT_FOUND));

		RuntimeException ex = assertThrows(RuntimeException.class, () -> {
			githubController.GetCommitHistory(null, "octocat", "Hello-World", "invalid-branch");
		});
		assertNotNull(ex.getMessage());

		mockServer.verify();
	}

	@Test
	void testGetDirectoryTreeSuccess()
	{
		String mockTreeResponse = """
				{
					"sha": "9b0f12345",
					"tree": [
						{ "path": "src", "type": "tree" },
						{ "path": "src/App.java", "type": "blob", "size": 204 },
						{ "path": "README.md", "type": "blob", "size": 512}
					]
				}
				""";
		
		mockServer.expect(requestTo("https://api.github.com/repos/octocat/Hello-World/git/trees/master?recursive=1"))
				.andExpect(method(HttpMethod.GET))
				.andRespond(withSuccess(mockTreeResponse, MediaType.APPLICATION_JSON));

		var response = githubController.GetDirectoryTree(null, "octocat", "Hello-World", "master");

		assertEquals(200, response.getStatusCode().value());
		assertTrue(response.getBody().contains("README.md"));

		mockServer.verify();
	}

	@Test
	void testGetDirectoryTreeNotFound()
	{
		mockServer.expect(requestTo("https://api.github.com/repos/octocat/Hello-World/git/trees/invalid-branch?recursive=1"))
				.andExpect(method(HttpMethod.GET))
				.andRespond(withStatus(HttpStatus.NOT_FOUND));

		RuntimeException ex = assertThrows(RuntimeException.class, () -> {
			githubController.GetDirectoryTree(null, "octocat", "Hello-World", "invalid-branch");
		});
		assertNotNull(ex.getMessage());

		mockServer.verify();
	}
}