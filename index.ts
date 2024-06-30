import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { getDatabase, tracked } from "./db";

const transparentPngBuffer = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489000000017352474200aece1ce90000000b494441541857636000020000050001aad5c8510000000049454e44ae426082",
    "hex",
);


type IPInfo = {
    query: string;
    status: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
};

type TrackedData = {
    trackerId: string;
    timestamp: number;
    type: string;
    host: string;
    pathname: string;
    user_agent: string;
    ip: string;
    ip_info: string;
};

async function track(request: Request, id?: string) {
    const referrer = request.headers.get("referer");
    const { host, pathname } = referrer
        ? new URL(referrer)
        : {
            host: "",
            pathname: "",
        };

    const type = request.method;
    const user_agent = request.headers.get("user-agent") || "";
    const ip_list = request.headers.get("x-forwarded-for")?.split(",");
    const ip = ip_list?.at(0)?.trim() || "";
    const ip_info = await fetch(`http://ip-api.com/json/${ip}`);
    const ip_info_json = (await ip_info.json()) as IPInfo;

    const trackedData: TrackedData = {
        trackerId: id || "",
        timestamp: Date.now(),
        type,
        host,
        pathname,
        user_agent,
        ip,
        ip_info: JSON.stringify(ip_info_json),
    };

    console.log(`${new Date().toLocaleString()} - Hit from ${ip === "" ? "localhost" : ip} (${ip_info_json.country}, ${ip_info_json.city}) id ${id || ""} from ${user_agent}`)
    await db.insert(tracked).values(trackedData);
}

console.log("🚀 Elysia is starting...")
console.log("🔗 Database is connecting...")
const db = await getDatabase();
console.log("🔗 Database is ready!")

const app = new Elysia();
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
    }),
);

app
    .get("/", async ({ request }) => {
        track(request);

        return new Response(
            `
            <!DOCTYPE html>
            <html>
                <body>
                    <h1>&#x1F98A; Elysia</h1>
                    <p>
                        Welcome to Elysia! This is a simple tracking pixel service.
                    </p>
                </body>
            </html>`,
            {
                headers: {
                    "content-type": "text/html",
                },
            },
        );
    })
    .get("/id/:id", async ({ params: { id }, request }) => {
        track(request, id);

        return new Response(transparentPngBuffer, {
            headers: {
                "content-type": "image/png",
            },
        });
    })
    .get("/data", async () => {
        const data = await db.select().from(tracked).all();

        return new Response(JSON.stringify(data), {
            headers: {
                "content-type": "application/json",
            },
        });
    })
    .listen(4000);

console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);