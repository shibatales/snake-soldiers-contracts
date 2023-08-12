import * as CC from './catalogConstants';
import { SnakeCatalog } from '../typechain-types';

async function configureCatalog(
  catalog: SnakeCatalog,
  elementGemAddress: string,
  skillGemAddress: string,
  factionGemAddress: string,
): Promise<void> {
  console.log('Configuring catalog.');

  await catalog.addPartList([
    {
      partId: CC.SLOT_ELEMENT_GEM_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_ELEMENT_GEM_SLOT,
        equippable: [elementGemAddress],
        metadataURI: CC.SLOT_ELEMENT_GEM_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_SKILL_GEM_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_SKILL_GEM_SLOT,
        equippable: [skillGemAddress],
        metadataURI: CC.SLOT_SKILL_GEM_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_FACTION_GEM_ID,
      part: {
        itemType: CC.Z_INDEX_FACTION_GEM_SLOT,
        z: 10,
        equippable: [factionGemAddress],
        metadataURI: CC.SLOT_FACTION_GEM_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BACKGROUND_ID,
      part: {
        itemType: CC.Z_INDEX_BACKGROUND_SLOT,
        z: 10,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BACKGROUND_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_HEAD_ID,
      part: {
        itemType: CC.Z_INDEX_FACTION_GEM_SLOT,
        z: 10,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_HEAD_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_CHEST_ID,
      part: {
        itemType: CC.Z_INDEX_CHEST_SLOT,
        z: 10,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_CHEST_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BODY_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_BODY_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BODY_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_LEFT_HAND_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_LEFT_HAND_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_LEFT_HAND_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_RIGHT_HAND_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_RIGHT_HAND_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_RIGHT_HAND_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BADGE_1_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_BADGE_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BADGE_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BADGE_2_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_BADGE_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BADGE_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BADGE_3_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_BADGE_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BADGE_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BADGE_4_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_BADGE_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BADGE_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_BADGE_5_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_BADGE_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_BADGE_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_EXTRA_1_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_EXTRA_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_EXTRA_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_EXTRA_2_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_EXTRA_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_EXTRA_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_EXTRA_3_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_EXTRA_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_EXTRA_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_EXTRA_4_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_EXTRA_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_EXTRA_METADATA_URI,
      },
    },
    {
      partId: CC.SLOT_EXTRA_5_ID,
      part: {
        itemType: 1,
        z: CC.Z_INDEX_EXTRA_SLOT,
        equippable: [], // Will be set later
        metadataURI: CC.SLOT_EXTRA_METADATA_URI,
      },
    },
    {
      partId: CC.FIXED_FRAME_GENERAL_ID,
      part: {
        itemType: 2,
        z: CC.Z_INDEX_FRAME_FIXED,
        equippable: [],
        metadataURI: CC.FIXED_FRAME_GENERAL_METADATA_URI,
      },
    },
    {
      partId: CC.FIXED_FRAME_COMMANDER_ID,
      part: {
        itemType: 2,
        z: CC.Z_INDEX_FRAME_FIXED,
        equippable: [],
        metadataURI: CC.FIXED_FRAME_COMMANDER_METADATA_URI,
      },
    },
    {
      partId: CC.FIXED_FRAME_SOLDIER_ID,
      part: {
        itemType: 2,
        z: CC.Z_INDEX_FRAME_FIXED,
        equippable: [],
        metadataURI: CC.FIXED_FRAME_SOLDIER_METADATA_URI,
      },
    },
  ]);
  console.log(`Catalog configured.`);
}

export default configureCatalog;
