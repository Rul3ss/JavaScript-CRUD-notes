import { registerAs } from "@nestjs/config";

export default registerAs('note', () => ({
    test1: 'value1',
    test2: 'value2',
}));