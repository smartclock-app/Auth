# Auth

This repository contains an example authentication server for SmartClock. It handles OAuth flows for both Google & Trakt.

## Installation

1. Clone the repository:

```sh
git clone https://github.com/smartclock-app/Auth.git
```

2. Navigate to the project directory:

```sh
cd Auth
```

3. Install dependencies:

```sh
bun install
```

## Usage

1. Copy `.env.example` to `.env` file in the project root and fill in the variables
2. Start the authentication server:

```sh
bun start
```

3. The server will be running at the port from your `.env`.

## API Endpoints

- `GET /google` - Initiates Google OAuth.
- `GET /google/callback` - Callback endpoint for Google OAuth.

- `GET /trakt` - Initiates Trakt OAuth.
- `GET /trakt/callback` - Callback endpoint for Trakt OAuth.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Example

To authenticate using Google OAuth, follow these steps:

1. Open your browser and go to `http://localhost:3000/google`.
2. Login with your Google account.
3. You will be redirected to `http://localhost:3000/google/callback` with your tokens.

To authenticate using Trakt OAuth, follow these steps:

1. Open your browser and go to `http://localhost:3000/trakt`.
2. Login with your Trakt account.
3. You will be redirected to `http://localhost:3000/trakt/callback` with your tokens.

These tokens can then be used to authenticate further requests within the SmartClock project.
