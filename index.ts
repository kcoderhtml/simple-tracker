import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import outdent from "outdent";

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

const app = new Elysia();
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
    }),
);

app.get("/", async () => {
    return new Response(
        `
            <html>
                <body>
                    <h1>🦊 Elysia</h1>
                    <p>
                        Elysia is a simple image server that returns a transparent PNG image.
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
    .get("/:id", async ({ params: { id }, query: { type }, request }) => {
        const referrer = request.headers.get("referer");
        const { host, pathname } = referrer
            ? new URL(referrer)
            : {
                host: "",
                pathname: "",
            };

        let result;
        const user_agent = request.headers.get("user-agent");
        const ip_list = request.headers.get("x-forwarded-for")?.split(",");
        const ip = ip_list?.at(0)?.trim() || "";
        const ip_info = await fetch(`http://ip-api.com/json/${ip}`);
        const ip_info_json = (await ip_info.json()) as IPInfo;

        console.log(ip_info_json);

        return new Response(transparentPngBuffer, {
            headers: {
                "content-type": "image/png",
            },
        });
    })
    .listen(4000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);