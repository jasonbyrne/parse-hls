import { Manifest } from "./models/manifest";

const parse = (hlsContent: string) => new Manifest(hlsContent);

export default parse;
export { Manifest };
