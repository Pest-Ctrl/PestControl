package com.pestcontrol.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "http://localhost:3000")
public class GitHubController
{
	private final RestClient restClient;

	public GitHubController(RestClient.Builder restClientBuilder)
	{
		this.restClient = restClientBuilder
			.baseUrl("https://api.github.com")
			.defaultHeader("Accept","application/vnd.github.v3+json")
			.build();
	}

	// Commit history of a repository
	@GetMapping("/commit-history")
	public ResponseEntity<String> GetCommitHistory(
		@RequestHeader(value = "Authorization", required=false) String AuthHeader,
		@RequestParam("owner") String Owner,
		@RequestParam("repo") String Repo,
		@RequestParam(value = "branch", defaultValue = "main") String Branch
	)
	{
		var Response = restClient.get()
			.uri("/repos/{owner}/{repo}/commits?sha={branch}",Owner,Repo, Branch);

		if (AuthHeader != null && !AuthHeader.isBlank())
		{
			Response.header("Authorization", AuthHeader);
		}

		return Response.retrieve()
			.onStatus(code -> code.is4xxClientError(), (request,response) -> {
				throw new RuntimeException("Client Error from GitHub: " + response.getStatusCode());
			})
			.onStatus(code -> code.is5xxServerError(), (request,response) -> {
				throw new RuntimeException("Server Error from GitHub: " + response.getStatusCode());
			})
			.toEntity(String.class);
	}

	// Directory Tree of a rpeo
	@GetMapping("/directory-tree")
	public ResponseEntity<String> GetDirectoryTree(
		@RequestHeader(value = "Authorization", required = false) String AuthHeader,
		@RequestParam("owner") String Owner,
		@RequestParam("repo") String Repo,
		@RequestParam(value = "branch", defaultValue = "main") String Branch
	)
	{
		var Response = restClient.get()
			.uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",Owner,Repo,Branch);
			
			if (AuthHeader != null && !AuthHeader.isBlank())
			{
				Response.header("Authorization", AuthHeader);
			}

			return Response.retrieve()
				.onStatus(code -> code.is4xxClientError(), (request,response) -> {
					throw new RuntimeException("Client Error from GitHub: " + response.getStatusCode());
				})
				.onStatus(code -> code.is5xxServerError(), (request,response) -> {
					throw new RuntimeException("Server Error from GitHub: " + response.getStatusCode());
				})
				.toEntity(String.class);
	}
}
