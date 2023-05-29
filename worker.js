import { expose } from "threads/worker";
import { encodeWithIterations, decodeWithIterations } from "./work";

expose({ encode: encodeWithIterations, decode: decodeWithIterations });
