Sure — here is the complete content formatted as a .md file. You can save it directly as github-api-root-endpoints.md.

# GitHub REST API Root Endpoints

**Base URL:** `https://api.github.com`

> **Note:** The endpoints below are the URI templates returned by the GitHub REST API root endpoint. Values such as `{owner}`, `{repo}`, `{user}`, and `{org}` are placeholders that must be replaced with actual values.

---

## 👤 User & Authentication

| # | Root Key | HTTP Endpoint / Template | Use |
|---|---|---|---|
| 1 | `current_user_url` | `GET /user` | Get information about the currently authenticated GitHub user. |
| 2 | `current_user_authorizations_html_url` | `https://github.com/settings/connections/applications{/client_id}` | Web page for managing applications authorized by the user. |
| 3 | `authorizations_url` | `/authorizations` | Legacy OAuth authorization management endpoint. |
| 4 | `emails_url` | `/user/emails` | List, add, or delete email addresses associated with the authenticated user. |
| 5 | `followers_url` | `/user/followers` | List users who follow the authenticated user. |
| 6 | `following_url` | `/user/following{/target}` | List users followed by the authenticated user or check whether a particular user is followed. |
| 7 | `keys_url` | `/user/keys` | Manage public SSH keys associated with the authenticated user. |
| 8 | `user_url` | `/users/{user}` | Get public information about a specific GitHub user. |

### Examples

```http
GET https://api.github.com/user

GET https://api.github.com/users/octocat

GET https://api.github.com/user/followers

GET https://api.github.com/user/following

GET https://api.github.com/user/following/octocat

GET https://api.github.com/user/emails

GET https://api.github.com/user/keys

🔎 Search APIs
#	Root Key	HTTP Endpoint / Template	Use
9	code_search_url	/search/code?q={query}{&page,per_page,sort,order}	Search code across repositories you can access.
10	commit_search_url	/search/commits?q={query}{&page,per_page,sort,order}	Search commits using keywords and qualifiers.
11	issue_search_url	/search/issues?q={query}{&page,per_page,sort,order}	Search issues and pull requests using GitHub search qualifiers.
12	label_search_url	/search/labels?q={query}&repository_id={repository_id}{&page,per_page}	Search for labels associated with a repository.
13	repository_search_url	/search/repositories?q={query}{&page,per_page,sort,order}	Search GitHub repositories.
14	topic_search_url	/search/topics?q={query}{&page,per_page}	Search repository topics.
15	user_search_url	/search/users?q={query}{&page,per_page,sort,order}	Search GitHub users.
Examples
GET https://api.github.com/search/repositories?q=machine-learning

GET https://api.github.com/search/repositories?q=machine-learning&page=2&per_page=10

GET https://api.github.com/search/users?q=octocat

GET https://api.github.com/search/issues?q=is:open+label:bug

GET https://api.github.com/search/commits?q=fix

GET https://api.github.com/search/code?q=useState

📦 Repository APIs
#	Root Key	HTTP Endpoint / Template	Use
16	repository_url	/repos/{owner}/{repo}	Get information about a specific repository.
17	repository_search_url	/search/repositories?q={query}{&page,per_page,sort,order}	Search repositories by name, description, language, topics, etc.
18	current_user_repositories_url	/user/repos{?type,page,per_page,sort}	List repositories owned by or accessible to the authenticated user.
19	user_repositories_url	/users/{user}/repos{?type,page,per_page,sort}	List repositories belonging to a particular user.
20	starred_url	/user/starred{/owner}{/repo}	List repositories starred by the authenticated user or check whether a repository is starred.
Examples
GET https://api.github.com/repos/octocat/Hello-World

GET https://api.github.com/user/repos

GET https://api.github.com/users/octocat/repos

GET https://api.github.com/user/starred

GET https://api.github.com/user/starred/octocat/Hello-World

🏢 Organization APIs
#	Root Key	HTTP Endpoint / Template	Use
21	organization_url	/orgs/{org}	Get information about a GitHub organization.
22	organization_repositories_url	/orgs/{org}/repos{?type,page,per_page,sort}	List repositories belonging to an organization.
23	organization_teams_url	/orgs/{org}/teams	List teams belonging to an organization.
24	user_organizations_url	/user/orgs	List organizations the authenticated user belongs to.
Examples
GET https://api.github.com/orgs/github

GET https://api.github.com/orgs/github/repos

GET https://api.github.com/orgs/github/teams

GET https://api.github.com/user/orgs

📝 Gist APIs
#	Root Key	HTTP Endpoint / Template	Use
25	gists_url	/gists{/gist_id}	Create, list, retrieve, update, or delete Gists.
26	public_gists_url	/gists/public	List public Gists.
27	starred_gists_url	/gists/starred	List Gists starred by the authenticated user.
Examples
GET https://api.github.com/gists

GET https://api.github.com/gists/public

GET https://api.github.com/gists/starred

GET https://api.github.com/gists/abc123

🔔 Activity, Issues & Notifications
#	Root Key	HTTP Endpoint / Template	Use
28	events_url	/events	Retrieve public GitHub events.
29	feeds_url	/feeds	Get feed URLs associated with the authenticated user.
30	issues_url	/issues	List issues visible to the authenticated user across repositories.
31	notifications_url	/notifications	Retrieve notifications for the authenticated user.
Examples
GET https://api.github.com/events

GET https://api.github.com/feeds

GET https://api.github.com/issues

GET https://api.github.com/notifications

🔗 Legacy / Integration API
#	Root Key	HTTP Endpoint / Template	Use
32	hub_url	/hub	Legacy PubSubHubbub-related endpoint for GitHub event subscriptions.

For new integrations, GitHub generally recommends webhooks or GitHub Apps instead of relying on legacy mechanisms.

⚡ Rate Limit API
#	Root Key	HTTP Endpoint / Template	Use
33	rate_limit_url	/rate_limit	Check API rate-limit status, including remaining requests and reset information.
Example
GET https://api.github.com/rate_limit

😃 Emoji API

The GitHub API root also exposes:

Root Key	HTTP Endpoint	Use
emojis_url	/emojis	Get the list of emoji names and their corresponding image URLs supported by GitHub.
Example
GET https://api.github.com/emojis

📋 Complete Endpoint List
GET https://api.github.com/user

https://github.com/settings/connections/applications{/client_id}

GET https://api.github.com/authorizations

GET https://api.github.com/search/code?q={query}{&page,per_page,sort,order}

GET https://api.github.com/search/commits?q={query}{&page,per_page,sort,order}

GET https://api.github.com/user/emails

GET https://api.github.com/emojis

GET https://api.github.com/events

GET https://api.github.com/feeds

GET https://api.github.com/user/followers

GET https://api.github.com/user/following{/target}

GET https://api.github.com/gists{/gist_id}

GET https://api.github.com/hub

GET https://api.github.com/search/issues?q={query}{&page,per_page,sort,order}

GET https://api.github.com/issues

GET https://api.github.com/user/keys

GET https://api.github.com/search/labels?q={query}&repository_id={repository_id}{&page,per_page}

GET https://api.github.com/notifications

GET https://api.github.com/orgs/{org}

GET https://api.github.com/orgs/{org}/repos{?type,page,per_page,sort}

GET https://api.github.com/orgs/{org}/teams

GET https://api.github.com/gists/public

GET https://api.github.com/rate_limit

GET https://api.github.com/repos/{owner}/{repo}

GET https://api.github.com/search/repositories?q={query}{&page,per_page,sort,order}

GET https://api.github.com/user/repos{?type,page,per_page,sort}

GET https://api.github.com/user/starred{/owner}{/repo}

GET https://api.github.com/gists/starred

GET https://api.github.com/search/topics?q={query}{&page,per_page}

GET https://api.github.com/users/{user}

GET https://api.github.com/user/orgs

GET https://api.github.com/users/{user}/repos{?type,page,per_page,sort}

GET https://api.github.com/search/users?q={query}{&page,per_page,sort,order}

🔧 Understanding URI Templates

GitHub's root endpoint uses URI Template syntax.

Path Parameters
{owner}


Represents a required value in the URL path.

Example:

/repos/{owner}/{repo}


becomes:

/repos/octocat/Hello-World

Query Parameters
{?page,per_page,sort}


Represents optional query parameters.

Example:

/user/repos{?page,per_page,sort}


can become:

/user/repos?page=1&per_page=10&sort=updated

Additional Query Parameters
{&page,per_page,sort,order}


means additional optional query parameters.

For example:

/search/repositories?q=react{&page,per_page,sort,order}


can become:

/search/repositories?q=react&page=1&per_page=10&sort=stars&order=desc

🌐 HTTP Methods

The endpoint path alone does not determine what operation is performed.

HTTP Method	Typical Purpose
GET	Retrieve data
POST	Create a resource
PUT	Replace a resource or perform an idempotent operation
PATCH	Modify part of an existing resource
DELETE	Delete a resource
Example

The same repository endpoint can support different operations:

GET /repos/{owner}/{repo}

PATCH /repos/{owner}/{repo}

DELETE /repos/{owner}/{repo}


For example:

GET https://api.github.com/repos/octocat/Hello-World


retrieves the repository.

🔐 Authentication

Authenticated GitHub API requests can include an access token.

Example:

Authorization: Bearer YOUR_TOKEN
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28


Example using cURL:

curl \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/user


Never commit your GitHub access token to a public repository.

🧪 cURL Examples
Get Current User
curl \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/user

Get Repository
curl \
  https://api.github.com/repos/octocat/Hello-World

Search Repositories
curl \
  "https://api.github.com/search/repositories?q=machine-learning"

List User Repositories
curl \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/user/repos

List Followers
curl \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/user/followers

Check Rate Limit
curl \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/rate_limit

🐍 Python Examples

Using the requests library:

import requests

BASE_URL = "https://api.github.com"
TOKEN = "YOUR_TOKEN"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

response = requests.get(
    f"{BASE_URL}/user",
    headers=headers
)

print(response.json())

📦 Repository Example
import requests

owner = "octocat"
repo = "Hello-World"

url = f"https://api.github.com/repos/{owner}/{repo}"

response = requests.get(url)

if response.ok:
    data = response.json()

    print("Name:", data["name"])
    print("Owner:", data["owner"]["login"])
    print("Stars:", data["stargazers_count"])
    print("Forks:", data["forks_count"])
else:
    print("Error:", response.status_code)

🔎 Search Example
import requests

url = "https://api.github.com/search/repositories"

params = {
    "q": "machine-learning",
    "sort": "stars",
    "order": "desc",
    "per_page": 10,
}

response = requests.get(url, params=params)

data = response.json()

for repository in data["items"]:
    print(
        repository["full_name"],
        repository["stargazers_count"]
    )

📌 Important: Root Endpoints Are Not the Entire GitHub API

The 33 root-level links returned by:

https://api.github.com/


are not the complete GitHub REST API.

They are an index pointing to major API resources.

For example:

/repos/{owner}/{repo}


is only the starting repository resource.

GitHub exposes many additional repository endpoints.

Examples:

GET    /repos/{owner}/{repo}

PATCH  /repos/{owner}/{repo}

DELETE /repos/{owner}/{repo}

GET    /repos/{owner}/{repo}/contents/{path}

GET    /repos/{owner}/{repo}/issues

POST   /repos/{owner}/{repo}/issues

GET    /repos/{owner}/{repo}/pulls

GET    /repos/{owner}/{repo}/branches

GET    /repos/{owner}/{repo}/commits

GET    /repos/{owner}/{repo}/releases

GET    /repos/{owner}/{repo}/tags

GET    /repos/{owner}/{repo}/collaborators

GET    /repos/{owner}/{repo}/webhooks


Therefore:

GitHub API Root
      │
      ├── Users
      ├── Repositories
      ├── Search
      ├── Organizations
      ├── Gists
      ├── Issues
      ├── Notifications
      ├── Events
      ├── Rate Limits
      └── Many additional REST resources

🗂️ Endpoint Categories
Category	Important Root Endpoints
👤 Users	/user, /users/{user}
🔐 Authentication	/authorizations
📧 Emails	/user/emails
👥 Followers	/user/followers
➡️ Following	/user/following
🔑 SSH Keys	/user/keys
🔎 Code Search	/search/code
🔎 Commit Search	/search/commits
🔎 Issue Search	/search/issues
🔎 Label Search	/search/labels
🔎 Repository Search	/search/repositories
🔎 Topic Search	/search/topics
🔎 User Search	/search/users
📦 Repositories	/repos/{owner}/{repo}
📦 User Repositories	/user/repos
⭐ Starred Repositories	/user/starred
🏢 Organizations	/orgs/{org}
👥 Organization Teams	/orgs/{org}/teams
📝 Gists	/gists
🌎 Public Gists	/gists/public
⭐ Starred Gists	/gists/starred
🔔 Notifications	/notifications
📋 Issues	/issues
📡 Events	/events
📰 Feeds	/feeds
😃 Emojis	/emojis
⚡ Rate Limit	/rate_limit
🔗 Legacy Hub	/hub
🚀 Recommended API Request Structure

For production applications, a request generally looks like:

GET https://api.github.com/repos/{owner}/{repo}


with headers such as:

Accept: application/vnd.github+json
Authorization: Bearer YOUR_TOKEN
X-GitHub-Api-Version: 2022-11-28


Example:

GET https://api.github.com/repos/octocat/Hello-World
Accept: application/vnd.github+json
Authorization: Bearer YOUR_TOKEN
X-GitHub-Api-Version: 2022-11-28

📚 Summary

The GitHub REST API root exposes links to major API resources such as:

User information
Authentication
Email addresses
Followers
Following
SSH keys
Code search
Commit search
Issue search
Label search
Repository search
Topic search
User search
Repositories
User repositories
Starred repositories
Organizations
Organization repositories
Organization teams
User organizations
Gists
Public Gists
Starred Gists
Events
Feeds
Issues
Notifications
Emojis
Legacy Hub
Rate limits

Note: The root response is an API index, not a complete endpoint catalog. Each resource, especially repositories, users, organizations, Actions, issues, and pull requests, contains many additional REST endpoints.