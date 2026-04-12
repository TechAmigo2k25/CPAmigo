const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuid } = require("uuid");
const config = require("./dockerConfig");

const TIMEOUT = 5000;

function execute(command, cwd, input = null) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { timeout: TIMEOUT, cwd });

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(stderr || stdout);
      } else {
        resolve(stdout);
      }
    });
  });
}

exports.runCode = async (code, language, testCases) => {
  const lang = config[language];

  if (!lang) throw new Error("Unsupported language");

  console.log("Running language:", language);

  const jobId = uuid();
  const dir = path.join(__dirname, "../temp", jobId);

  await fs.ensureDir(dir);
  await fs.writeFile(path.join(dir, lang.file), code);

  const results = [];
  const finalres = { totaltestcasepassed: 0, status: "", testcases: [] };
  let counter = 0;

  try {
    // -------- COMPILE STEP --------
    if (lang.compile) {
      console.log("COMPILE COMMAND:", lang.compile);

      try {
        await execute(lang.compile, dir);
        console.log("Compilation successful");
      } catch (error) {
        console.log("Compilation failed:", error);

        return {
          totaltestcasepassed: 0,
          status: "Compile Error",
          testcases: [
            {
              input: "",
              expectedOutput: "",
              actualOutput: error.toString(),
              status: "Compile Error",
            },
          ],
        };
      }
    }

    // -------- RUN TEST CASES --------
    for (const test of testCases) {
      let status = "Passed";
      let actualOutput = "";

      try {
        console.log("RUN COMMAND:", lang.run);

        actualOutput = await execute(lang.run, dir, test.input);

        if (actualOutput.trim() !== test.expectedOutput.trim()) {
          status = "Failed";
        } else {
          counter++;
        }

      } catch (err) {
        actualOutput = err.toString();
        status = "Runtime Error";
      }

      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        actualOutput: actualOutput.trim(),
        status,
      });
    }
  } finally {
    await fs.remove(dir);

    finalres.totaltestcasepassed = counter;
    finalres.testcases = results;
    finalres.status =
      counter === testCases.length ? "Passed" : "Failed";
  }

  return finalres;
};