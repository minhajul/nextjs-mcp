import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';

// Define the input schema
const rollDiceInputSchema = z.object({
    sides: z.number().int().min(2)
});

// Infer the input type from the schema
type RollDiceInput = z.infer<typeof rollDiceInputSchema>;

const handler = createMcpHandler(server => {
    server.tool(
        'roll_dice',
        'Rolls an N-sided die',
        rollDiceInputSchema,
        async ({ sides }: RollDiceInput) => {
            const value = 1 + Math.floor(Math.random() * sides);
            return { content: [{ type: 'text', text: `🎲 You rolled a ${value}!` }] };
        }
    );
});

export { handler as GET, handler as POST, handler as DELETE };