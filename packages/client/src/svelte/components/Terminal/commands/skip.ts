import type { Command } from "../types";
import { COMMAND } from "../types";
import { spawn, transfer } from "../../../modules/action";
import { loadingLine, loadingSpinner, writeToTerminal } from "../functions/writeToTerminal";
import { waitForCompletion, waitForTransaction } from "../functions/helpers";
import { OutputType } from "../types"
import { playSound } from "../../../modules/sound";

async function execute() {
    writeToTerminal(OutputType.NORMAL, "Skipping intro...")

    writeToTerminal(OutputType.NORMAL, "Spawning")
    const spawnAction = spawn()
    await waitForTransaction(spawnAction, loadingSpinner)
    await waitForCompletion(spawnAction, loadingLine);
    playSound("tcm2", "TRX_yes")
    writeToTerminal(OutputType.SUCCESS, "Spawn done")

    writeToTerminal(OutputType.NORMAL, "Transferring")
    const transferAction = transfer()
    await waitForTransaction(transferAction, loadingSpinner);
    await waitForCompletion(transferAction, loadingLine);
    playSound("tcm2", "TRX_yes")
    writeToTerminal(OutputType.SUCCESS, "Transfer done")

    return;
}

export const skip: Command<[]> = {
    id: COMMAND.SKIP,
    public: false,
    name: "skip",
    alias: "s",
    description: "Skip intro",
    fn: execute,
}