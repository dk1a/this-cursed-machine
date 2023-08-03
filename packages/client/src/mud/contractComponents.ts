/* Autogenerated file. Do not edit manually. */

import { TableId } from "@latticexyz/common";
import { defineComponent, Type as RecsType, World } from "@latticexyz/recs";

export function defineContractComponents(world: World) {
  return {
    Type: (() => {
      const tableId = new TableId("mc", "Type");
      return defineComponent(
        world,
        {
          value: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    Name: (() => {
      const tableId = new TableId("mc", "Name");
      return defineComponent(
        world,
        {
          value: RecsType.String,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    Energy: (() => {
      const tableId = new TableId("mc", "Energy");
      return defineComponent(
        world,
        {
          value: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    CreationBlock: (() => {
      const tableId = new TableId("mc", "CreationBlock");
      return defineComponent(
        world,
        {
          value: RecsType.BigInt,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    ReadyBlock: (() => {
      const tableId = new TableId("mc", "ReadyBlock");
      return defineComponent(
        world,
        {
          value: RecsType.BigInt,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    BodyId: (() => {
      const tableId = new TableId("mc", "BodyId");
      return defineComponent(
        world,
        {
          value: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    Level: (() => {
      const tableId = new TableId("mc", "Level");
      return defineComponent(
        world,
        {
          value: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    Position: (() => {
      const tableId = new TableId("mc", "Position");
      return defineComponent(
        world,
        {
          x: RecsType.Number,
          y: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    ConnectionCapacity: (() => {
      const tableId = new TableId("mc", "ConnectionCapaci");
      return defineComponent(
        world,
        {
          value: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    SourceEntity: (() => {
      const tableId = new TableId("mc", "SourceEntity");
      return defineComponent(
        world,
        {
          value: RecsType.String,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    TargetEntity: (() => {
      const tableId = new TableId("mc", "TargetEntity");
      return defineComponent(
        world,
        {
          value: RecsType.String,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    ClaimBlock: (() => {
      const tableId = new TableId("mc", "ClaimBlock");
      return defineComponent(
        world,
        {
          value: RecsType.BigInt,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
    GameConfig: (() => {
      const tableId = new TableId("mc", "GameConfig");
      return defineComponent(
        world,
        {
          worldHeight: RecsType.Number,
          worldWidth: RecsType.Number,
          coolDown: RecsType.Number,
          coreEnergyCap: RecsType.Number,
          coreInitialEnergy: RecsType.Number,
          resourceConnectionCost: RecsType.Number,
          controlConnectionCost: RecsType.Number,
          buildCost: RecsType.Number,
        },
        {
          metadata: {
            contractId: tableId.toHex(),
            tableId: tableId.toString(),
          },
        }
      );
    })(),
  };
}
