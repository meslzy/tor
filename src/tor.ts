import {findAvailablePorts} from "@meslzy/port";
import {path as root} from "app-root-path";

import Session from "./session";

import * as path from "path";

interface Properties {
	debug?: boolean,
	tor?: string;
	torrc?: string;
	port?: {
		socks?: [number, number];
		http?: [number, number];
	};
}

class Tor {
	private readonly properties = {
		debug: false,
		tor: path.join(root, "lib", "tor.exe"),
		torrc: path.join(root, "lib", "torrc"),
		port: {
			socks: [8000, 9080],
			http: [5000, 6050],
		}
	};
	
	public sessions: Session[] = [];
	
	constructor(properties: Properties) {
		this.properties = Object.assign({}, this.properties, properties);
		
		if (this.properties.debug) {
			process.env["debug"] = "debug";
		}
	}
	
	public createSession = async (port?: { socks?: number, http?: number }): Promise<Session> => {
		const exclude = this.sessions.reduce((exclude: number[], session) => {
			return exclude.concat([session.port.socks, session.port.http]);
		}, []);
		
		const socksPort = this.properties.port?.socks;
		const socks = port?.socks ?? (await findAvailablePorts({min: socksPort[0], max: socksPort[1], limit: 1, exclude}))[0];
		const httpPort = this.properties.port?.http;
		const http = port?.http ?? (await findAvailablePorts({min: httpPort[0], max: httpPort[1], limit: 1, exclude}))[0];
		
		const session = new Session(this.properties.tor, this.properties.torrc, socks, http);
		
		this.sessions.push(session);
		
		return session;
	};
	
	public removeSession = (session: Session) => {
		this.sessions = this.sessions.filter(({id}) => id !== session.id);
	};
}

export default Tor;
