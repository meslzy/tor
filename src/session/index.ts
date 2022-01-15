import {ChildProcess, execFile} from "child_process";

import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

interface session {
	port: {
		socks: number;
		http: number;
	};
}

class Session {
	readonly port: session["port"] = {
		socks: 0,
		http: 0,
	};
	
	public readonly address = {
		socks: "",
		http: "",
	};
	
	private readonly tor;
	private readonly torrc;
	
	public readonly id;
	
	private process: ChildProcess | null = null;
	
	constructor(tor: string, torrc: string, socks: number, http: number) {
		this.tor = tor;
		this.torrc = torrc;
		
		this.port.socks = socks;
		this.port.http = http;
		
		this.id = crypto.randomBytes(5).toString("hex");
		
		this.address.socks = `127.0.0.1:${this.port.socks}`;
		this.address.http = `127.0.0.1:${this.port.http}`;
	}
	
	public start = async () => new Promise<void>((resolve, reject) => {
		if (this.process) return reject("session already running");
		
		const DataDirectory = path.join(this.torrc, "DataDirectory", this.id);
		fs.mkdirSync(DataDirectory, {recursive: true});
		
		const GeoIPFile = path.join(this.torrc, "GeoIPFile", this.id);
		fs.mkdirSync(GeoIPFile, {recursive: true});
		
		const GeoIPv6File = path.join(this.torrc, "GeoIPv6File", this.id);
		fs.mkdirSync(GeoIPv6File, {recursive: true});
		
		const torrcConfiguration: string[] = [];
		
		torrcConfiguration.push(`SocksPort ${this.port.socks}`);
		torrcConfiguration.push(`HTTPTunnelPort ${this.port.http}`);
		torrcConfiguration.push(`SocksBindAddress 127.0.0.1`);
		torrcConfiguration.push(`DataDirectory ${DataDirectory.replace(/\\/g, "/")}`);
		torrcConfiguration.push(`GeoIPFile ${GeoIPFile.replace(/\\/g, "/")}`);
		torrcConfiguration.push(`GeoIPv6File ${GeoIPv6File.replace(/\\/g, "/")}`);
		
		const torrcConfigurationPath = path.join(this.torrc, this.id);
		
		fs.writeFileSync(torrcConfigurationPath, torrcConfiguration.join("\n"));
		
		this.process = execFile(this.tor, ["-f", torrcConfigurationPath]);
		
		this.process.stdout?.on("data", (data: string) => {
			if (process.env["debug"] === "debug") console.log(data);
			
			if (data.includes("100%") && data.includes("done")) {
				resolve();
			}
		});
	});
	
	public close = () => {
		this.process?.kill();
		this.process = null;
	};
}

export default Session;
