import * as os from "os";
import * as path from "path";
import { Uri, workspace } from "vscode";
import { PrettierVSCodeConfig } from "./types";

function hasTilda(filePath: string): boolean {
  return (
    process.platform === "darwin" &&
    filePath.indexOf("~") === 0 &&
    !!os.homedir()
  );
}

export function getWorkspaceRelativePath(
  filePath: string,
  pathToResolve: string
) {
  // In case the user wants to use ~/.prettierrc on Mac
  if (hasTilda(pathToResolve)) {
    return pathToResolve.replace(/^~(?=$|\/|\\)/, os.homedir());
  }

  if (workspace.workspaceFolders) {
    const folder = workspace.getWorkspaceFolder(Uri.file(filePath));
    return folder
      ? path.isAbsolute(pathToResolve)
        ? pathToResolve
        : path.join(folder.uri.fsPath, pathToResolve)
      : undefined;
  }
}

export function isWorkspaceRelativePath(
  filePath: string,
  pathToResolve: string | undefined
) {
  if (
    !pathToResolve ||
    hasTilda(pathToResolve) ||
    !workspace.workspaceFolders
  ) {
    return false;
  }

  const folder = workspace.getWorkspaceFolder(Uri.file(filePath));
  if (!folder) {
    return false;
  }

  if (path.isAbsolute(pathToResolve)) {
    return pathToResolve.startsWith(folder.uri.fsPath);
  }

  const resolvedPath = path.resolve(folder.uri.fsPath, pathToResolve);
  return resolvedPath.startsWith(folder.uri.fsPath);
}

export function getConfig(uri?: Uri): PrettierVSCodeConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return workspace.getConfiguration("prettier", uri) as any;
}
