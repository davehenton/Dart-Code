import { DebugSession } from "vscode-debugadapter";
import { MultiDebugSession } from "./multi_debug_impl";

DebugSession.run(MultiDebugSession);
