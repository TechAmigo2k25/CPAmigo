module.exports = {
  c: {
    file: "main.c",
    compile: "gcc main.c -o main",
    run: "./main",
  },
  cpp: {
    file: "main.cpp",
    compile: "g++ main.cpp -o main",
    run: "./main",
  },
  java: {
    file: "Main.java",
    compile: "javac Main.java",
    run: "java Main",
  },
  python: {
    file: "main.py",
    run: "python3 main.py",
  },
  javascript: {
    file: "main.js",
    run: "node main.js",
  }
};