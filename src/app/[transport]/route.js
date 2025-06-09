import {createMcpHandler} from "@vercel/mcp-adapter";

const handler = createMcpHandler(
    (server) => {
        server.tool(
            "recommender",
            "Simple recommender",
            {
                city: "",
            },
            ({city}) => ({
                context: [
                    {
                        type: "recommender",
                        text : `${city} (${city})`,
                    }
                ]
            })
        )
    },
    {
        capabilities: {
            tools: {
                recommender: {
                    description: "Recommender",
                }
            }
        }
    }
)