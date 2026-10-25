import { execFileSync, spawnSync } from "node:child_process";
import { cp, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const buildDirectory = join(projectDirectory, "dist");
const sourceRevision = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
	cwd: projectDirectory,
	encoding: "utf8",
}).trim();
const temporaryDirectory = await mkdtemp(join(tmpdir(), "mqtt-waarden-pages-"));
const siteDirectory = join(temporaryDirectory, "site");

try {
	execFileSync(
		"git",
		[
			"clone",
			"--depth",
			"1",
			"--branch",
			"main",
			"--single-branch",
			"https://github.com/BartdeJong/WeatherProd.git",
			siteDirectory,
		],
		{ stdio: "inherit" }
	);

	for (const entry of await readdir(siteDirectory, { withFileTypes: true })) {
		if (entry.name !== ".git" && entry.name !== ".github") {
			await rm(join(siteDirectory, entry.name), { recursive: true, force: true });
		}
	}

	for (const entry of await readdir(buildDirectory, { withFileTypes: true })) {
		await cp(join(buildDirectory, entry.name), join(siteDirectory, entry.name), {
			recursive: true,
			force: true,
		});
	}

	execFileSync("git", ["-C", siteDirectory, "add", "--all"], { stdio: "inherit" });
	const diff = spawnSync("git", ["-C", siteDirectory, "diff", "--cached", "--quiet"], {
		stdio: "ignore",
	});
	if (diff.error) throw diff.error;
	if (diff.status === 0) {
		console.info("The deployed site is already up to date.");
	} else if (diff.status === 1) {
		execFileSync(
			"git",
			[
				"-C",
				siteDirectory,
				"commit",
				"-m",
				`Deploy MQTT app from ${sourceRevision}`,
				"-m",
				"Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>",
			],
			{ stdio: "inherit" }
		);
		execFileSync("git", ["-C", siteDirectory, "push", "origin", "main"], {
			stdio: "inherit",
		});
	} else {
		throw new Error(`Unable to check staged deployment changes (git status ${diff.status}).`);
	}
} finally {
	await rm(temporaryDirectory, { recursive: true, force: true });
}
