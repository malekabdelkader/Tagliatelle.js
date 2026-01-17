# Minimal Example

The simplest possible Tagliatelle.js server.

## Run

```bash
npx tsx examples/minimal/server.tsx
```

## Test

```bash
curl http://localhost:3000/hello
# {"message":"Hello from Tagliatelle!"}
```

## What's happening?

1. `<Server port={3000}>` - Creates a Fastify server on port 3000
2. `<Get path="/hello" handler={hello} />` - Registers a GET route
3. `render(<App />)` - Compiles JSX to Fastify and starts the server

That's it! Check out the full examples in `examples/server.tsx` for more features.
