import Dexie, { type Table } from "dexie";

export class Database extends Dexie {
	history!: Table<HistoryItem>;
	tab!: Table<TabItem>;

	constructor() {
		super("ai");
		this.version(4).stores({
			history: "++id, session, type, role, content, src",
			tab: "++id, label",
		});
		this.version(5)
			.stores({
				tab: "++id, label, created_at",
				history: "++id, session, type, role, content, src, created_at",
			})
			.upgrade((trans) => {
				return trans
					.table("history")
					.toCollection()
					.modify(async (i) => {
						if (i.type === "image") {
							i.content = "";
							i.src = [i.src];
						}
					});
			});
	}

	getLatestTab() {
		return DB.tab.orderBy("id").last();
	}

	getTabs() {
		return DB.tab.limit(100).reverse().toArray();
	}

	async getHistory(session: number) {
		const arr = await DB.history
			.where("session")
			.equals(session)
			.limit(100)
			.toArray();
		arr.forEach((i) => {
			if (i.type === "image") {
				i.src_url = [];
				i.src?.forEach((src) => {
					i.src_url!.push(URL.createObjectURL(src));
				});
				i.content = "image";
			}
		});
		return arr;
	}

	addTab(label: string) {
		return DB.tab.add({ label, created_at: Date.now() });
	}

	deleteTabAndHistory(id: number) {
		return DB.transaction("rw", DB.tab, DB.history, async () => {
			await DB.tab.delete(id);
			await DB.history.where("session").equals(id).delete();
		});
	}
}

export const DB = new Database();

export const initialSettings = {
	openaiKey: "",
	image_steps: 20,
	system_prompt: "",
};

export type Settings = typeof initialSettings;

export const uniModals: Model[] = [
	{
		id: "gemini-2.5-flash-lite",
		name: "Gemini 2.5 Flash-Lite",
		provider: "google",
		type: "universal",
	},
	{
		id: "gemini-2.5-pro",
		name: "Gemini 2.5 Pro",
		provider: "google",
		type: "universal",
	},
	{
		id: "gemini-2.5-flash",
		name: "Gemini 2.5 Flash",
		provider: "google",
		type: "universal",
	},
	{
		id: "gemini-2.0-flash",
		name: "Gemini 2.0 Flash",
		provider: "google",
		type: "universal",
	},
	{
		id: "gemini-2.0-flash-lite",
		name: "Gemini 2.0 Flash-Lite",
		provider: "google",
		type: "universal",
	},
];

export const textGenModels: Model[] = [
	{
		id: "@cf/openai/gpt-oss-120b",
		name: "gpt-oss-120b",
		provider: "workers-ai",
		type: "chat",
	},
	{
		id: "@cf/openai/gpt-oss-20b",
		name: "gpt-oss-120b",
		provider: "workers-ai",
		type: "chat",
	},
	{
		id: "@cf/meta/llama-4-scout-17b-16e-instruct",
		name: "llama-4-scout-17b-16e-instruct",
		provider: "workers-ai",
		type: "chat",
	},
	{
		id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
		name: "llama-3.3-70b-instruct-fp8-fast",
		provider: "workers-ai",
		type: "chat",
	},
	{
		id: "@cf/meta/llama-3.1-8b-instruct-fast",
		name: "llama-3.1-8b-instruct-fast",
		provider: "workers-ai",
		type: "chat",
	},
	{
		id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
		name: "deepseek-r1-distill-qwen-32b",
		provider: "workers-ai",
		type: "chat",
	},
];

export const imageGenModels: Model[] = [];

export const models: Model[] = [
	...uniModals,
	...textGenModels,
	...imageGenModels,
];
