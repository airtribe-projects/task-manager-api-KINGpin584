Simple Task API
This is a high-performance, file-system-based Task Management API built with Node.js, Express, and TypeScript. It uses an in-memory cache for speed and a write-ahead log for data durability.

Getting Started
Prerequisites
Node.js (v18 or higher recommended)

npm or yarn

Installation & Setup
Clone the repository:

git clone <your-repo-url>
cd <your-repo-folder>

Install dependencies:

npm install

Run the development server:
This command uses ts-node-dev to automatically restart the server when you make code changes.

npm run dev

The API will now be running at http://localhost:3000.

Design and Logic Flow
The application follows a layered architecture designed for speed and safety.

In-Memory First: All tasks are stored in a Map in memory for extremely fast access. All read requests (GET) are served directly from this cache.

Write-Ahead Log (WAL): For data safety, every write operation (create, update, delete) is immediately appended as a single line to a db.log file. This guarantees that no data is lost even if the server crashes.

Data Snapshots: The main database is a JSON file (tasks.json) which acts as a snapshot of the data at a point in time.

Startup Recovery: When the server starts, it first loads the tasks.json snapshot and then replays any "leftover" operations from db.log to bring the in-memory cache to a perfectly current state.

Compaction: After a certain number of writes, a compact process runs, writing the current in-memory state to tasks.json and clearing the log file.

Graceful Shutdown: The server listens for shutdown signals (like Ctrl+C) and performs one final compaction before exiting to ensure all recent changes are saved.

API Endpoints
All endpoints are prefixed with /api.

GET /tasks
Retrieves a list of all tasks.

Query Param: priority (optional) - Filter by high, medium, or low.

Example: GET /api/tasks?priority=high

GET /tasks/:id
Retrieves a single task by its ID.

POST /tasks
Creates a new task.

Body:

{
  "title": "My New Task",
  "description": "Details about the task.",
  "priority": "high"
}

PATCH /tasks/:id
Updates an existing task. Only include the fields you want to change.

Body:

{
  "completed": true
}

DELETE /tasks/:id
Deletes a task. Returns a 204 No Content response on success.

How to Test
Use curl or any API client to test the endpoints.

1. Create a task:

curl -X POST http://localhost:3000/api/tasks \
-H "Content-Type: application/json" \
-d '{"title": "Test the API", "description": "Write a curl command"}'

2. Get all tasks:

curl http://localhost:3000/api/tasks

3. Update a task (replace :id with an actual task ID):

curl -X PATCH http://localhost:3000/api/tasks/:id \
-H "Content-Type: application/json" \
-d '{"completed": true, "priority": "low"}'

4. Delete a task (replace :id with an actual task ID):

curl -X DELETE http://localhost:3000/api/tasks/:id
