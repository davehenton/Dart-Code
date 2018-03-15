import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import {
	DebugSession,
	InitializedEvent, TerminatedEvent, StoppedEvent, BreakpointEvent, OutputEvent, Event,
	Thread, StackFrame, Scope, Source, Handles, Breakpoint, ThreadEvent, Variable, ModuleEvent,
	Module,
	CapabilitiesEvent,
} from "vscode-debugadapter";
import { DebugProtocol } from "vscode-debugprotocol";
import { FlutterLaunchRequestArguments } from "./utils";
import { DartDebugSession } from "./dart_debug_impl";
import { FlutterDebugSession } from "./flutter_debug_impl";
import { FlutterTestDebugSession } from "./flutter_test_debug_impl";

export class MultiDebugSession extends DebugSession {

	private session: DartDebugSession;
	private type: DebugType;

	protected initializeRequest(
		response: DebugProtocol.InitializeResponse,
		args: DebugProtocol.InitializeRequestArguments,
	): void {
		response.body.supportsConfigurationDoneRequest = true;
		response.body.supportsEvaluateForHovers = true;
		response.body.exceptionBreakpointFilters = [
			{ filter: "All", label: "All Exceptions", default: false },
			{ filter: "Unhandled", label: "Uncaught Exceptions", default: true },
		];
		this.sendResponse(response);
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: FlutterLaunchRequestArguments): void {
		// Figure out which type of debugger need.
		const isFlutter = !!args.flutterPath;
		const isFlutterTest = isFlutter && args.program && args.program.indexOf(path.join(args.cwd, "test")) !== -1;
		const newType = isFlutterTest ? DebugType.FlutterTest : (isFlutter ? DebugType.Flutter : DebugType.Dart);

		// We don't handle changing types.
		if (this.session && newType !== this.type) {
			response.success = false;
			response.message = "Unable to change debug type";
			this.sendResponse(response);
		} else {
			if (!this.session) {
				this.type = newType;
				switch (newType) {
					case DebugType.Dart:
						this.session = new DartDebugSession(this);
					case DebugType.Flutter:
						this.session = new FlutterDebugSession(this);
					case DebugType.FlutterTest:
						this.session = new FlutterTestDebugSession(this);
				}

			}
			this.session.launchRequest(response, args);
		}
	}

	protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments): void {
		this.session.disconnectRequest(response, args);
		super.disconnectRequest(response, args);
	}

	protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
		this.session.setBreakPointsRequest(response, args);
	}

	protected setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments): void {
		this.session.setExceptionBreakPointsRequest(response, args);
	}

	protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
		this.session.configurationDoneRequest(response, args);
	}

	protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void {
		this.session.pauseRequest(response, args);
	}

	protected sourceRequest(response: DebugProtocol.SourceResponse, args: DebugProtocol.SourceArguments): void {
		this.session.sourceRequest(response, args);
	}

	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
		this.session.threadsRequest(response);
	}

	protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {
		this.session.stackTraceRequest(response, args);
	}

	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
		this.session.scopesRequest(response, args);
	}

	protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): void {
		this.session.variablesRequest(response, args);
	}

	protected setVariableRequest(response: DebugProtocol.SetVariableResponse, args: DebugProtocol.SetVariableArguments): void {
		this.session.setVariableRequest(response, args);
	}

	protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
		this.session.continueRequest(response, args);
	}

	protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
		this.session.nextRequest(response, args);
	}

	protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void {
		this.session.stepInRequest(response, args);
	}

	protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void {
		this.session.stepOutRequest(response, args);
	}

	protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void {
		this.session.stepBackRequest(response, args);
	}

	protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
		this.session.evaluateRequest(response, args);
	}

	protected customRequest(request: string, response: DebugProtocol.Response, args: any): void {
		this.session.customRequest(request, response, args);
	}
}

enum DebugType {
	Dart,
	Flutter,
	FlutterTest,
}
