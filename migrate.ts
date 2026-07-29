import { Project, SyntaxKind, PropertyAssignment } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("app/api/**/*.ts");

const files = project.getSourceFiles();

files.forEach(file => {
  let changed = false;

  // Replace Groq imports
  const imports = file.getImportDeclarations();
  imports.forEach(imp => {
    if (imp.getModuleSpecifierValue() === "groq-sdk") {
      imp.setModuleSpecifier("@google/genai");
      imp.setDefaultImport(undefined);
      imp.addNamedImport("GoogleGenAI");
      changed = true;
    }
  });

  // Replace Groq instantiations
  const varDecls = file.getVariableDeclarations();
  varDecls.forEach(decl => {
    if (decl.getInitializer()?.getText().includes("new Groq")) {
      decl.rename("ai");
      decl.setInitializer("new GoogleGenAI()");
      changed = true;
    }
  });

  // Replace fetch calls
  const callExprs = file.getDescendantsOfKind(SyntaxKind.CallExpression);
  callExprs.forEach(call => {
    const exprText = call.getExpression().getText();
    if (exprText === "fetch") {
      const args = call.getArguments();
      if (args.length > 0 && args[0].getText().includes("api.groq.com")) {
        // Just flag fetch calls for manual review
        console.log(`Manual review needed for fetch call in ${file.getFilePath()}`);
      }
    }
  });

  file.saveSync();
});
console.log("Refactoring complete");
