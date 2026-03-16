import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import http from "http";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Forward all non-API requests to the Expo web server (islamic-prayer serve.js)
const EXPO_PORT = process.env.EXPO_APP_PORT || "23172";

app.use((req: Request, res: Response) => {
  const options = {
    hostname: "127.0.0.1",
    port: parseInt(EXPO_PORT, 10),
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${EXPO_PORT}`,
    },
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on("error", () => {
    res.status(502).send("App server unavailable");
  });

  req.pipe(proxy, { end: true });
});

export default app;
