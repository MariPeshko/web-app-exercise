# API Contract - Version 0.1

## Authentication

## 1. Sign Up
- **URL:** `/api/auth/signup`
- **Method:** `POST`
- Headers: Content-Type: `application/json`
- **Request Body:**
```json
{
  "email": "user@example.com",
  "nickname": "Student123",
  "password": "strongpassword123"
}
```

- **Response (201 Created)**:

Media type: application/json
```json
{
	"message": "User created successfully",
	"user_id": 2
}
```

- Response 400 (?) We don't have cases for this error. Let it be here some time for the future.

- **Response 409 Conflict**

Response body:
```json
{
  "detail": "E-Mail already registered."
}
```
Or
```json
{
  "detail": "Nickname already in use."
}
```

- Response 400 (?) We don't have cases for this error. Let it be here some time for the future.

- **Response 422 Unprocessable Entity** (Wrong email format)

Error 422 is a fastAPI error that occurs before the function code even runs. As soon as the request arrives at the server, Pydantic (which is under the hood of SQLModel) checks if the data matches the model.

- "loc" (Location): Shows where the error is. ["body", "email"]
- "msg" (Message): Human language that explains what went wrong.
- "type": Technical error code for frontend developers.

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address: An email address must have an @-sign.",
      "input": "example0.com",
      "ctx": {
        "reason": "An email address must have an @-sign."
      }
    }
  ]
}
```

## 2. Login

- URL: `/api/auth/login`
- Method: `POST`
- Headers: Content-Type: `application/x-www-form-urlencoded`

*Note: `application/x-www-form-urlencoded` encodes form data as key-value pairs, separated by `&`, with `=` separating keys and values (e.g., `name=John+Doe&age=25`). Non-alphanumeric characters are percent-encoded (e.g., spaces become `+` or `%20`).*

**Request Body:**

The body must be sent as `x-www-form-urlencoded` data (like a standard HTML form submission), not as JSON.

- `username`: The user's email address. (string, **required**)
- `password`: The user's password. (string, **required**)

**Example of raw request body:**
```
username=user%40example.com&password=strongpassword123
```

- **Response (200 OK)** (In case of successful login)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmc1QGV4YW1wbGUuY29tIiwibmlja25hbWUiOiJzdHJpbmc1IiwiZXhwIjoxNzcxNzYwMTE1fQ.N4H9x5H3PQqUT0KAueP92XhpKymI1F744nt3LY14kyU",
  "token_type": "bearer"
}
```
**Access Token Payload (Decoded):**
`"sub": user.email, "nickname": user.nickname`
- sub: User's email (Subject).
- nickname: User's public name.
- exp: Token expiration time (Current time + 60 minutes).


### **401 Unauthorized**:

**Scenario**: User provided wrong email or incorrect password.

**Headers**: 'WWW-Authenticate: Bearer'

```json
{
  "detail": "Invalid email or password"
}
```


### 3. Logout (In progress (Sabina))

....

### 4. Delete account (In progress)

...

## Document Management

### 1. Upload Document

- URL: `/api/documents/upload`
- Method: `POST`
- Content-Type: `multipart/form-data`

- Response (202 Accepted):
```json
{
  "document_id": "uuid-string",
  "status": "processing"
}
```
