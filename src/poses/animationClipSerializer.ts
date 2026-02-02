import * as THREE from 'three';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';

/**
 * Serialize an AnimationClip to JSON format
 * This allows us to save FBX animation data and reload it later
 */
export interface SerializedAnimationClip {
  name: string;
  duration: number;
  tracks: SerializedTrack[];
}

interface SerializedTrack {
  name: string;
  type: 'quaternion' | 'vector' | 'number';
  times: number[];
  values: number[];
}

/**
 * VRM Bone Name Mapping
 * 
 * Maps various bone naming conventions to standard VRM humanoid bone names.
 * Supports:
 * 1. VRM Standard: Normalized_rightUpperArm
 * 2. Legacy/Unity: Normalized_upper_armR, Normalized_shoulderR
 * 3. Direct: rightUpperArm, hips
 * 
 * Based on CharacterStudio patterns: https://github.com/M3-org/CharacterStudio
 */
const VRM_BONE_MAP: Record<string, VRMHumanBoneName> = {
  // ============================================
  // VRM Standard Normalized names (camelCase)
  // ============================================
  'Normalized_hips': 'hips' as VRMHumanBoneName,
  'Normalized_spine': 'spine' as VRMHumanBoneName,
  'Normalized_chest': 'chest' as VRMHumanBoneName,
  'Normalized_upperChest': 'upperChest' as VRMHumanBoneName,
  'Normalized_neck': 'neck' as VRMHumanBoneName,
  'Normalized_head': 'head' as VRMHumanBoneName,
  'Normalized_leftShoulder': 'leftShoulder' as VRMHumanBoneName,
  'Normalized_leftUpperArm': 'leftUpperArm' as VRMHumanBoneName,
  'Normalized_leftLowerArm': 'leftLowerArm' as VRMHumanBoneName,
  'Normalized_leftHand': 'leftHand' as VRMHumanBoneName,
  'Normalized_leftUpperLeg': 'leftUpperLeg' as VRMHumanBoneName,
  'Normalized_leftLowerLeg': 'leftLowerLeg' as VRMHumanBoneName,
  'Normalized_leftFoot': 'leftFoot' as VRMHumanBoneName,
  'Normalized_leftToes': 'leftToes' as VRMHumanBoneName,
  'Normalized_rightShoulder': 'rightShoulder' as VRMHumanBoneName,
  'Normalized_rightUpperArm': 'rightUpperArm' as VRMHumanBoneName,
  'Normalized_rightLowerArm': 'rightLowerArm' as VRMHumanBoneName,
  'Normalized_rightHand': 'rightHand' as VRMHumanBoneName,
  'Normalized_rightUpperLeg': 'rightUpperLeg' as VRMHumanBoneName,
  'Normalized_rightLowerLeg': 'rightLowerLeg' as VRMHumanBoneName,
  'Normalized_rightFoot': 'rightFoot' as VRMHumanBoneName,
  'Normalized_rightToes': 'rightToes' as VRMHumanBoneName,

  // ============================================
  // Generic / Mixamo-style Raw Names (often capitalized)
  // Frequently found in custom prefixes like AvatarsR2_0052
  // ============================================
  'Hips': 'hips' as VRMHumanBoneName,
  'Spine': 'spine' as VRMHumanBoneName,
  'Spine1': 'chest' as VRMHumanBoneName,
  'Spine2': 'upperChest' as VRMHumanBoneName,
  'Neck': 'neck' as VRMHumanBoneName,
  'Head': 'head' as VRMHumanBoneName,
  'LeftShoulder': 'leftShoulder' as VRMHumanBoneName,
  'LeftArm': 'leftUpperArm' as VRMHumanBoneName,
  'LeftForeArm': 'leftLowerArm' as VRMHumanBoneName,
  'LeftHand': 'leftHand' as VRMHumanBoneName,
  'LeftUpLeg': 'leftUpperLeg' as VRMHumanBoneName,
  'LeftLeg': 'leftLowerLeg' as VRMHumanBoneName,
  'LeftFoot': 'leftFoot' as VRMHumanBoneName,
  'LeftToeBase': 'leftToes' as VRMHumanBoneName,
  'RightShoulder': 'rightShoulder' as VRMHumanBoneName,
  'RightArm': 'rightUpperArm' as VRMHumanBoneName,
  'RightForeArm': 'rightLowerArm' as VRMHumanBoneName,
  'RightHand': 'rightHand' as VRMHumanBoneName,
  'RightUpLeg': 'rightUpperLeg' as VRMHumanBoneName,
  'RightLeg': 'rightLowerLeg' as VRMHumanBoneName,
  'RightFoot': 'rightFoot' as VRMHumanBoneName,
  'RightToeBase': 'rightToes' as VRMHumanBoneName,
  
  // Generic Fingers (often capitalized, map to standard VRM)
  // NOTE: Handedness is often implied by the full path, extractBoneNameFromTrack handles this.
  'Thumb1': 'leftThumbProximal' as VRMHumanBoneName, 
  'Thumb2': 'leftThumbIntermediate' as VRMHumanBoneName,
  'Thumb3': 'leftThumbDistal' as VRMHumanBoneName,
  'Index1': 'leftIndexProximal' as VRMHumanBoneName,
  'Index2': 'leftIndexIntermediate' as VRMHumanBoneName,
  'Index3': 'leftIndexDistal' as VRMHumanBoneName,
  'Middle1': 'leftMiddleProximal' as VRMHumanBoneName,
  'Middle2': 'leftMiddleIntermediate' as VRMHumanBoneName,
  'Middle3': 'leftMiddleDistal' as VRMHumanBoneName,
  'Ring1': 'leftRingProximal' as VRMHumanBoneName,
  'Ring2': 'leftRingIntermediate' as VRMHumanBoneName,
  'Ring3': 'leftRingDistal' as VRMHumanBoneName,
  'Pinky1': 'leftLittleProximal' as VRMHumanBoneName,
  'Pinky2': 'leftLittleIntermediate' as VRMHumanBoneName,
  'Pinky3': 'leftLittleDistal' as VRMHumanBoneName,

  // ============================================
  // Mixamo Standard Rig (mixamorig prefix)
  // ============================================
  // Hips & Spine  // ============================================
  // Hips & Spine
  'mixamorigHips': 'hips' as VRMHumanBoneName,
  'mixamorig_Hips': 'hips' as VRMHumanBoneName,
  'mixamorigSpine': 'spine' as VRMHumanBoneName,
  'mixamorig_Spine': 'spine' as VRMHumanBoneName,
  'mixamorigSpine1': 'chest' as VRMHumanBoneName,
  'mixamorig_Spine1': 'chest' as VRMHumanBoneName,
  'mixamorigSpine2': 'upperChest' as VRMHumanBoneName,
  'mixamorig_Spine2': 'upperChest' as VRMHumanBoneName,
  'mixamorigNeck': 'neck' as VRMHumanBoneName,
  'mixamorig_Neck': 'neck' as VRMHumanBoneName,
  'mixamorigHead': 'head' as VRMHumanBoneName,
  'mixamorig_Head': 'head' as VRMHumanBoneName,

  // Arms
  'mixamorigLeftShoulder': 'leftShoulder' as VRMHumanBoneName,
  'mixamorig_LeftShoulder': 'leftShoulder' as VRMHumanBoneName,
  'mixamorigLeftArm': 'leftUpperArm' as VRMHumanBoneName,
  'mixamorig_LeftArm': 'leftUpperArm' as VRMHumanBoneName,
  'mixamorigLeftForeArm': 'leftLowerArm' as VRMHumanBoneName,
  'mixamorig_LeftForeArm': 'leftLowerArm' as VRMHumanBoneName,
  'mixamorigLeftHand': 'leftHand' as VRMHumanBoneName,
  'mixamorig_LeftHand': 'leftHand' as VRMHumanBoneName,
  'mixamorigRightShoulder': 'rightShoulder' as VRMHumanBoneName,
  'mixamorig_RightShoulder': 'rightShoulder' as VRMHumanBoneName,
  'mixamorigRightArm': 'rightUpperArm' as VRMHumanBoneName,
  'mixamorig_RightArm': 'rightUpperArm' as VRMHumanBoneName,
  'mixamorigRightForeArm': 'rightLowerArm' as VRMHumanBoneName,
  'mixamorig_RightForeArm': 'rightLowerArm' as VRMHumanBoneName,
  'mixamorigRightHand': 'rightHand' as VRMHumanBoneName,
  'mixamorig_RightHand': 'rightHand' as VRMHumanBoneName,

  // Legs
  'mixamorigLeftUpLeg': 'leftUpperLeg' as VRMHumanBoneName,
  'mixamorig_LeftUpLeg': 'leftUpperLeg' as VRMHumanBoneName,
  'mixamorigLeftLeg': 'leftLowerLeg' as VRMHumanBoneName,
  'mixamorig_LeftLeg': 'leftLowerLeg' as VRMHumanBoneName,
  'mixamorigLeftFoot': 'leftFoot' as VRMHumanBoneName,
  'mixamorig_LeftFoot': 'leftFoot' as VRMHumanBoneName,
  'mixamorigLeftToeBase': 'leftToes' as VRMHumanBoneName,
  'mixamorig_LeftToeBase': 'leftToes' as VRMHumanBoneName,
  'mixamorigRightUpLeg': 'rightUpperLeg' as VRMHumanBoneName,
  'mixamorig_RightUpLeg': 'rightUpperLeg' as VRMHumanBoneName,
  'mixamorigRightLeg': 'rightLowerLeg' as VRMHumanBoneName,
  'mixamorig_RightLeg': 'rightLowerLeg' as VRMHumanBoneName,
  'mixamorigRightFoot': 'rightFoot' as VRMHumanBoneName,
  'mixamorig_RightFoot': 'rightFoot' as VRMHumanBoneName,
  'mixamorigRightToeBase': 'rightToes' as VRMHumanBoneName,
  'mixamorig_RightToeBase': 'rightToes' as VRMHumanBoneName,
  
  // Left Hand Fingers
  'mixamorigLeftHandThumb1': 'leftThumbProximal' as VRMHumanBoneName,
  'mixamorig_LeftHandThumb1': 'leftThumbProximal' as VRMHumanBoneName,
  'mixamorigLeftHandThumb2': 'leftThumbIntermediate' as VRMHumanBoneName,
  'mixamorig_LeftHandThumb2': 'leftThumbIntermediate' as VRMHumanBoneName,
  'mixamorigLeftHandThumb3': 'leftThumbDistal' as VRMHumanBoneName,
  'mixamorig_LeftHandThumb3': 'leftThumbDistal' as VRMHumanBoneName,
  'mixamorigLeftHandIndex1': 'leftIndexProximal' as VRMHumanBoneName,
  'mixamorig_LeftHandIndex1': 'leftIndexProximal' as VRMHumanBoneName,
  'mixamorigLeftHandIndex2': 'leftIndexIntermediate' as VRMHumanBoneName,
  'mixamorig_LeftHandIndex2': 'leftIndexIntermediate' as VRMHumanBoneName,
  'mixamorigLeftHandIndex3': 'leftIndexDistal' as VRMHumanBoneName,
  'mixamorig_LeftHandIndex3': 'leftIndexDistal' as VRMHumanBoneName,
  'mixamorigLeftHandMiddle1': 'leftMiddleProximal' as VRMHumanBoneName,
  'mixamorig_LeftHandMiddle1': 'leftMiddleProximal' as VRMHumanBoneName,
  'mixamorigLeftHandMiddle2': 'leftMiddleIntermediate' as VRMHumanBoneName,
  'mixamorig_LeftHandMiddle2': 'leftMiddleIntermediate' as VRMHumanBoneName,
  'mixamorigLeftHandMiddle3': 'leftMiddleDistal' as VRMHumanBoneName,
  'mixamorig_LeftHandMiddle3': 'leftMiddleDistal' as VRMHumanBoneName,
  'mixamorigLeftHandRing1': 'leftRingProximal' as VRMHumanBoneName,
  'mixamorig_LeftHandRing1': 'leftRingProximal' as VRMHumanBoneName,
  'mixamorigLeftHandRing2': 'leftRingIntermediate' as VRMHumanBoneName,
  'mixamorig_LeftHandRing2': 'leftRingIntermediate' as VRMHumanBoneName,
  'mixamorigLeftHandRing3': 'leftRingDistal' as VRMHumanBoneName,
  'mixamorig_LeftHandRing3': 'leftRingDistal' as VRMHumanBoneName,
  'mixamorigLeftHandPinky1': 'leftLittleProximal' as VRMHumanBoneName,
  'mixamorig_LeftHandPinky1': 'leftLittleProximal' as VRMHumanBoneName,
  'mixamorigLeftHandPinky2': 'leftLittleIntermediate' as VRMHumanBoneName,
  'mixamorig_LeftHandPinky2': 'leftLittleIntermediate' as VRMHumanBoneName,
  'mixamorigLeftHandPinky3': 'leftLittleDistal' as VRMHumanBoneName,
  'mixamorig_LeftHandPinky3': 'leftLittleDistal' as VRMHumanBoneName,

  // Right Hand Fingers
  'mixamorigRightHandThumb1': 'rightThumbProximal' as VRMHumanBoneName,
  'mixamorig_RightHandThumb1': 'rightThumbProximal' as VRMHumanBoneName,
  'mixamorigRightHandThumb2': 'rightThumbIntermediate' as VRMHumanBoneName,
  'mixamorig_RightHandThumb2': 'rightThumbIntermediate' as VRMHumanBoneName,
  'mixamorigRightHandThumb3': 'rightThumbDistal' as VRMHumanBoneName,
  'mixamorig_RightHandThumb3': 'rightThumbDistal' as VRMHumanBoneName,
  'mixamorigRightHandIndex1': 'rightIndexProximal' as VRMHumanBoneName,
  'mixamorig_RightHandIndex1': 'rightIndexProximal' as VRMHumanBoneName,
  'mixamorigRightHandIndex2': 'rightIndexIntermediate' as VRMHumanBoneName,
  'mixamorig_RightHandIndex2': 'rightIndexIntermediate' as VRMHumanBoneName,
  'mixamorigRightHandIndex3': 'rightIndexDistal' as VRMHumanBoneName,
  'mixamorig_RightHandIndex3': 'rightIndexDistal' as VRMHumanBoneName,
  'mixamorigRightHandMiddle1': 'rightMiddleProximal' as VRMHumanBoneName,
  'mixamorig_RightHandMiddle1': 'rightMiddleProximal' as VRMHumanBoneName,
  'mixamorigRightHandMiddle2': 'rightMiddleIntermediate' as VRMHumanBoneName,
  'mixamorig_RightHandMiddle2': 'rightMiddleIntermediate' as VRMHumanBoneName,
  'mixamorigRightHandMiddle3': 'rightMiddleDistal' as VRMHumanBoneName,
  'mixamorig_RightHandMiddle3': 'rightMiddleDistal' as VRMHumanBoneName,
  'mixamorigRightHandRing1': 'rightRingProximal' as VRMHumanBoneName,
  'mixamorig_RightHandRing1': 'rightRingProximal' as VRMHumanBoneName,
  'mixamorigRightHandRing2': 'rightRingIntermediate' as VRMHumanBoneName,
  'mixamorig_RightHandRing2': 'rightRingIntermediate' as VRMHumanBoneName,
  'mixamorigRightHandRing3': 'rightRingDistal' as VRMHumanBoneName,
  'mixamorig_RightHandRing3': 'rightRingDistal' as VRMHumanBoneName,
  'mixamorigRightHandPinky1': 'rightLittleProximal' as VRMHumanBoneName,
  'mixamorig_RightHandPinky1': 'rightLittleProximal' as VRMHumanBoneName,
  'mixamorigRightHandPinky2': 'rightLittleIntermediate' as VRMHumanBoneName,
  'mixamorig_RightHandPinky2': 'rightLittleIntermediate' as VRMHumanBoneName,
  'mixamorigRightHandPinky3': 'rightLittleDistal' as VRMHumanBoneName,
  'mixamorig_RightHandPinky3': 'rightLittleDistal' as VRMHumanBoneName,

  // ============================================
  // Legacy/Unity style (underscore + L/R suffix)
  // Used in older JSON animation files
  // ============================================
  // Shoulders
  'Normalized_shoulderL': 'leftShoulder' as VRMHumanBoneName,
  'Normalized_shoulderR': 'rightShoulder' as VRMHumanBoneName,
  // Arms
  'Normalized_upper_armL': 'leftUpperArm' as VRMHumanBoneName,
  'Normalized_upper_armR': 'rightUpperArm' as VRMHumanBoneName,
  'Normalized_lower_armL': 'leftLowerArm' as VRMHumanBoneName,
  'Normalized_lower_armR': 'rightLowerArm' as VRMHumanBoneName,
  'Normalized_handL': 'leftHand' as VRMHumanBoneName,
  'Normalized_handR': 'rightHand' as VRMHumanBoneName,
  // Legs
  'Normalized_upper_legL': 'leftUpperLeg' as VRMHumanBoneName,
  'Normalized_upper_legR': 'rightUpperLeg' as VRMHumanBoneName,
  'Normalized_lower_legL': 'leftLowerLeg' as VRMHumanBoneName,
  'Normalized_lower_legR': 'rightLowerLeg' as VRMHumanBoneName,
  'Normalized_footL': 'leftFoot' as VRMHumanBoneName,
  'Normalized_footR': 'rightFoot' as VRMHumanBoneName,
  'Normalized_toesL': 'leftToes' as VRMHumanBoneName,
  'Normalized_toesR': 'rightToes' as VRMHumanBoneName,
  
  // ============================================
  // Finger bones (VRM Standard)
  // ============================================
  // Left hand fingers
  'Normalized_leftThumbProximal': 'leftThumbProximal' as VRMHumanBoneName,
  'Normalized_leftThumbIntermediate': 'leftThumbIntermediate' as VRMHumanBoneName,
  'Normalized_leftThumbDistal': 'leftThumbDistal' as VRMHumanBoneName,
  'Normalized_leftIndexProximal': 'leftIndexProximal' as VRMHumanBoneName,
  'Normalized_leftIndexIntermediate': 'leftIndexIntermediate' as VRMHumanBoneName,
  'Normalized_leftIndexDistal': 'leftIndexDistal' as VRMHumanBoneName,
  'Normalized_leftMiddleProximal': 'leftMiddleProximal' as VRMHumanBoneName,
  'Normalized_leftMiddleIntermediate': 'leftMiddleIntermediate' as VRMHumanBoneName,
  'Normalized_leftMiddleDistal': 'leftMiddleDistal' as VRMHumanBoneName,
  'Normalized_leftRingProximal': 'leftRingProximal' as VRMHumanBoneName,
  'Normalized_leftRingIntermediate': 'leftRingIntermediate' as VRMHumanBoneName,
  'Normalized_leftRingDistal': 'leftRingDistal' as VRMHumanBoneName,
  'Normalized_leftLittleProximal': 'leftLittleProximal' as VRMHumanBoneName,
  'Normalized_leftLittleIntermediate': 'leftLittleIntermediate' as VRMHumanBoneName,
  'Normalized_leftLittleDistal': 'leftLittleDistal' as VRMHumanBoneName,
  // Right hand fingers
  'Normalized_rightThumbProximal': 'rightThumbProximal' as VRMHumanBoneName,
  'Normalized_rightThumbIntermediate': 'rightThumbIntermediate' as VRMHumanBoneName,
  'Normalized_rightThumbDistal': 'rightThumbDistal' as VRMHumanBoneName,
  'Normalized_rightIndexProximal': 'rightIndexProximal' as VRMHumanBoneName,
  'Normalized_rightIndexIntermediate': 'rightIndexIntermediate' as VRMHumanBoneName,
  'Normalized_rightIndexDistal': 'rightIndexDistal' as VRMHumanBoneName,
  'Normalized_rightMiddleProximal': 'rightMiddleProximal' as VRMHumanBoneName,
  'Normalized_rightMiddleIntermediate': 'rightMiddleIntermediate' as VRMHumanBoneName,
  'Normalized_rightMiddleDistal': 'rightMiddleDistal' as VRMHumanBoneName,
  'Normalized_rightRingProximal': 'rightRingProximal' as VRMHumanBoneName,
  'Normalized_rightRingIntermediate': 'rightRingIntermediate' as VRMHumanBoneName,
  'Normalized_rightRingDistal': 'rightRingDistal' as VRMHumanBoneName,
  'Normalized_rightLittleProximal': 'rightLittleProximal' as VRMHumanBoneName,
  'Normalized_rightLittleIntermediate': 'rightLittleIntermediate' as VRMHumanBoneName,
  'Normalized_rightLittleDistal': 'rightLittleDistal' as VRMHumanBoneName,

  // ============================================
  // Common Typos & Alternate Names found in wild animations
  // ============================================
  // Typo in some animation files
  'Normalized_rightLoweArm': 'rightLowerArm' as VRMHumanBoneName,
  'Normalized_leftLoweArm': 'leftLowerArm' as VRMHumanBoneName,
  
  // Thumb Metacarpals (often map to Proximal in VRM if not explicit)
  'Normalized_leftThumbMetacarpal': 'leftThumbProximal' as VRMHumanBoneName,
  'Normalized_rightThumbMetacarpal': 'rightThumbProximal' as VRMHumanBoneName,
  
  // ============================================
  // Direct VRM bone names (from MotionEngine)
  // ============================================
  'hips': 'hips' as VRMHumanBoneName,
  'spine': 'spine' as VRMHumanBoneName,
  'chest': 'chest' as VRMHumanBoneName,
  'upperChest': 'upperChest' as VRMHumanBoneName,
  'neck': 'neck' as VRMHumanBoneName,
  'head': 'head' as VRMHumanBoneName,
  // Left side
  'leftShoulder': 'leftShoulder' as VRMHumanBoneName,
  'leftUpperArm': 'leftUpperArm' as VRMHumanBoneName,
  'leftLowerArm': 'leftLowerArm' as VRMHumanBoneName,
  'leftHand': 'leftHand' as VRMHumanBoneName,
  'leftUpperLeg': 'leftUpperLeg' as VRMHumanBoneName,
  'leftLowerLeg': 'leftLowerLeg' as VRMHumanBoneName,
  'leftFoot': 'leftFoot' as VRMHumanBoneName,
  'leftToes': 'leftToes' as VRMHumanBoneName,
  // Right side
  'rightShoulder': 'rightShoulder' as VRMHumanBoneName,
  'rightUpperArm': 'rightUpperArm' as VRMHumanBoneName,
  'rightLowerArm': 'rightLowerArm' as VRMHumanBoneName,
  'rightHand': 'rightHand' as VRMHumanBoneName,
  'rightUpperLeg': 'rightUpperLeg' as VRMHumanBoneName,
  'rightLowerLeg': 'rightLowerLeg' as VRMHumanBoneName,
  'rightFoot': 'rightFoot' as VRMHumanBoneName,
  'rightToes': 'rightToes' as VRMHumanBoneName,
  // Fingers (direct names)
  'leftThumbProximal': 'leftThumbProximal' as VRMHumanBoneName,
  'leftThumbIntermediate': 'leftThumbIntermediate' as VRMHumanBoneName,
  'leftThumbDistal': 'leftThumbDistal' as VRMHumanBoneName,
  'leftIndexProximal': 'leftIndexProximal' as VRMHumanBoneName,
  'leftIndexIntermediate': 'leftIndexIntermediate' as VRMHumanBoneName,
  'leftIndexDistal': 'leftIndexDistal' as VRMHumanBoneName,
  'leftMiddleProximal': 'leftMiddleProximal' as VRMHumanBoneName,
  'leftMiddleIntermediate': 'leftMiddleIntermediate' as VRMHumanBoneName,
  'leftMiddleDistal': 'leftMiddleDistal' as VRMHumanBoneName,
  'leftRingProximal': 'leftRingProximal' as VRMHumanBoneName,
  'leftRingIntermediate': 'leftRingIntermediate' as VRMHumanBoneName,
  'leftRingDistal': 'leftRingDistal' as VRMHumanBoneName,
  'leftLittleProximal': 'leftLittleProximal' as VRMHumanBoneName,
  'leftLittleIntermediate': 'leftLittleIntermediate' as VRMHumanBoneName,
  'leftLittleDistal': 'leftLittleDistal' as VRMHumanBoneName,
  'rightThumbProximal': 'rightThumbProximal' as VRMHumanBoneName,
  'rightThumbIntermediate': 'rightThumbIntermediate' as VRMHumanBoneName,
  'rightThumbDistal': 'rightThumbDistal' as VRMHumanBoneName,
  'rightIndexProximal': 'rightIndexProximal' as VRMHumanBoneName,
  'rightIndexIntermediate': 'rightIndexIntermediate' as VRMHumanBoneName,
  'rightIndexDistal': 'rightIndexDistal' as VRMHumanBoneName,
  'rightMiddleProximal': 'rightMiddleProximal' as VRMHumanBoneName,
  'rightMiddleIntermediate': 'rightMiddleIntermediate' as VRMHumanBoneName,
  'rightMiddleDistal': 'rightMiddleDistal' as VRMHumanBoneName,
  'rightRingProximal': 'rightRingProximal' as VRMHumanBoneName,
  'rightRingIntermediate': 'rightRingIntermediate' as VRMHumanBoneName,
  'rightRingDistal': 'rightRingDistal' as VRMHumanBoneName,
  'rightLittleProximal': 'rightLittleProximal' as VRMHumanBoneName,
  'rightLittleIntermediate': 'rightLittleIntermediate' as VRMHumanBoneName,
  'rightLittleDistal': 'rightLittleDistal' as VRMHumanBoneName,
};

/**
 * Bones that are optional in VRM and should not cause retargeting failure if missing
 */
const OPTIONAL_BONES = new Set<string>([
  'leftToes', 'rightToes',
  'leftEye', 'rightEye',
  'jaw',
  'upperChest',
  // Fingers are also optional but usually we want to know if they fail. 
  // Adding them here to reduce noise for simple avatars.
  'leftThumbProximal', 'leftThumbIntermediate', 'leftThumbDistal',
  'leftIndexProximal', 'leftIndexIntermediate', 'leftIndexDistal',
  'leftMiddleProximal', 'leftMiddleIntermediate', 'leftMiddleDistal',
  'leftRingProximal', 'leftRingIntermediate', 'leftRingDistal',
  'leftLittleProximal', 'leftLittleIntermediate', 'leftLittleDistal',
  'rightThumbProximal', 'rightThumbIntermediate', 'rightThumbDistal',
  'rightIndexProximal', 'rightIndexIntermediate', 'rightIndexDistal',
  'rightMiddleProximal', 'rightMiddleIntermediate', 'rightMiddleDistal',
  'rightRingProximal', 'rightRingIntermediate', 'rightRingDistal',
  'rightLittleProximal', 'rightLittleIntermediate', 'rightLittleDistal',
]);

/**
 * Convert THREE.AnimationClip to JSON-serializable format
 */
export function serializeAnimationClip(clip: THREE.AnimationClip): SerializedAnimationClip {
  const tracks: SerializedTrack[] = [];

  clip.tracks.forEach(track => {
    let type: 'quaternion' | 'vector' | 'number';
    
    if (track instanceof THREE.QuaternionKeyframeTrack) {
      type = 'quaternion';
    } else if (track instanceof THREE.VectorKeyframeTrack) {
      type = 'vector';
    } else if (track instanceof THREE.NumberKeyframeTrack) {
      type = 'number';
    } else {
      console.warn('[serializeAnimationClip] Unknown track type:', track.constructor.name);
      return;
    }

    tracks.push({
      name: track.name,
      type,
      times: Array.from(track.times),
      values: Array.from(track.values),
    });
  });

  return {
    name: clip.name,
    duration: clip.duration,
    tracks,
  };
}

/**
 * Convert serialized format back to THREE.AnimationClip
 */
export function deserializeAnimationClip(data: SerializedAnimationClip): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];

  data.tracks.forEach(trackData => {
    let track: THREE.KeyframeTrack;

    switch (trackData.type) {
      case 'quaternion':
        track = new THREE.QuaternionKeyframeTrack(
          trackData.name,
          trackData.times,
          trackData.values
        );
        break;
      case 'vector':
        track = new THREE.VectorKeyframeTrack(
          trackData.name,
          trackData.times,
          trackData.values
        );
        break;
      case 'number':
        track = new THREE.NumberKeyframeTrack(
          trackData.name,
          trackData.times,
          trackData.values
        );
        break;
      default:
        console.warn('[deserializeAnimationClip] Unknown track type:', trackData.type);
        return;
    }

    tracks.push(track);
  });

    if (data.tracks.length === 0) {
      console.warn(`[deserializeAnimationClip] Warning: AnimationClip "${data.name}" has 0 tracks.`);
    }

    return new THREE.AnimationClip(data.name, data.duration, tracks);
  }

/**
 * Get the hierarchical path to a node from the root
 */
function getNodePath(node: THREE.Object3D, root: THREE.Object3D): string | null {
  const path: string[] = [];
  let current: THREE.Object3D | null = node;

  while (current && current !== root) {
    path.unshift(current.name);
    current = current.parent;
  }

  if (current === root) {
    return path.join('/');
  }

  return null;
}

/**
 * Extract VRM bone name from a track name like "VRMHumanoidRig/Normalized_hips/Normalized_spine.quaternion"
 */
function extractBoneNameFromTrack(trackName: string): VRMHumanBoneName | null {
  // Extract the last bone name before the property (e.g., ".quaternion" or ".position")
  const propertyMatch = trackName.match(/^(.+)\.(quaternion|position|scale)$/);
  if (!propertyMatch) return null;
  
  const pathPart = propertyMatch[1];
  const parts = pathPart.split('/');
  const lastPart = parts[parts.length - 1]; // e.g., "Normalized_index_intermediateR"
  const lowerLastPart = lastPart.toLowerCase();

  // Attempt 1: Direct lookup in VRM_BONE_MAP (case-sensitive for direct keys)
  if (VRM_BONE_MAP[lastPart]) {
    return VRM_BONE_MAP[lastPart];
  }

  // Attempt 2: Iteratively strip common prefixes and try to find a match
  const commonPrefixes = [
    'VRMHumanoidRig/', 
    'Normalized_',
    'mixamorig:',
    'mixamorig',
    'AvatarsR2_0052', 
  ];

  let currentTestName = lastPart;
  for (const prefix of commonPrefixes) {
    if (currentTestName.startsWith(prefix)) {
      currentTestName = currentTestName.substring(prefix.length);
    }
    // After each strip, try to match against both VRM_BONE_MAP keys and values
    if (VRM_BONE_MAP[currentTestName]) {
        return VRM_BONE_MAP[currentTestName];
    }
    for (const vrmBone of Object.values(VRMHumanBoneName)) {
        if (currentTestName.toLowerCase() === vrmBone.toLowerCase()) {
            return vrmBone;
        }
    }
  }

  // Attempt 3: Specific handling for finger bones where handedness might be inferred from pathPart
  const fingerMap: Record<string, VRMHumanBoneName[]> = {
    'thumb1': [VRMHumanBoneName.LeftThumbMetacarpal, VRMHumanBoneName.RightThumbMetacarpal],
    'thumb2': [VRMHumanBoneName.LeftThumbProximal, VRMHumanBoneName.RightThumbProximal],
    'thumb3': [VRMHumanBoneName.LeftThumbDistal, VRMHumanBoneName.RightThumbDistal],
    'index1': [VRMHumanBoneName.LeftIndexProximal, VRMHumanBoneName.RightIndexProximal],
    'index2': [VRMHumanBoneName.LeftIndexIntermediate, VRMHumanBoneName.RightIndexIntermediate],
    'index3': [VRMHumanBoneName.LeftIndexDistal, VRMHumanBoneName.RightIndexDistal],
    'middle1': [VRMHumanBoneName.LeftMiddleProximal, VRMHumanBoneName.RightMiddleProximal],
    'middle2': [VRMHumanBoneName.LeftMiddleIntermediate, VRMHumanBoneName.RightMiddleIntermediate],
    'middle3': [VRMHumanBoneName.LeftMiddleDistal, VRMHumanBoneName.RightMiddleDistal],
    'ring1': [VRMHumanBoneName.LeftRingProximal, VRMHumanBoneName.RightRingProximal],
    'ring2': [VRMHumanBoneName.LeftRingIntermediate, VRMHumanBoneName.RightRingIntermediate],
    'ring3': [VRMHumanBoneName.LeftRingDistal, VRMHumanBoneName.RightRingDistal],
    'pinky1': [VRMHumanBoneName.LeftLittleProximal, VRMHumanBoneName.RightLittleProximal],
    'pinky2': [VRMHumanBoneName.LeftLittleIntermediate, VRMHumanBoneName.RightLittleIntermediate],
    'pinky3': [VRMHumanBoneName.LeftLittleDistal, VRMHumanBoneName.RightLittleDistal],
  };

  for (const fingerPart in fingerMap) {
    if (lowerLastPart.includes(fingerPart)) {
      const possibleBones = fingerMap[fingerPart];
      if (pathPart.toLowerCase().includes('left')) return possibleBones[0];
      if (pathPart.toLowerCase().includes('right')) return possibleBones[1];
    }
  }

  // Final fallback: Check if any VRMHumanBoneName is a suffix of the lastPart (case-insensitive)
  let bestMatch: VRMHumanBoneName | null = null;
  let bestMatchLength = 0;

  for (const vrmBone of Object.values(VRMHumanBoneName)) {
      const lowerVrmBone = vrmBone.toLowerCase();
      if (lowerLastPart.endsWith(lowerVrmBone) && lowerVrmBone.length > bestMatchLength) {
          bestMatch = vrmBone;
          bestMatchLength = lowerVrmBone.length;
      }
  }

  return bestMatch;
}

export interface RetargetOptions {
  stripHipsPosition?: boolean;
}

/**
 * Retarget an animation clip to work with a specific VRM model
 * This converts VRMHumanoidRig paths to actual scene node paths
 */
export function retargetAnimationClip(clip: THREE.AnimationClip, vrm: VRM, options: RetargetOptions = {}): THREE.AnimationClip {
  const retargetedTracks: THREE.KeyframeTrack[] = [];
  let successCount = 0;
  let failCount = 0;
  const failedTracks: string[] = [];

  console.log(`[retargetAnimationClip] Processing clip "${clip.name}" with ${clip.tracks.length} tracks`, options);

  clip.tracks.forEach(track => {
    const boneName = extractBoneNameFromTrack(track.name);
    
    if (!boneName) {
      // Track doesn't match VRM bone pattern, keep as-is
      console.log(`[retargetAnimationClip] Keeping track as-is (no bone match): ${track.name}`);
      retargetedTracks.push(track);
      return;
    }

    // Get the actual bone node from VRM humanoid
    const boneNode = vrm.humanoid?.getNormalizedBoneNode(boneName);
    if (!boneNode) {
      // If it's an optional bone (like toes), just log info and skip without error
      if (OPTIONAL_BONES.has(boneName)) {
        console.debug(`[retargetAnimationClip] Skipping optional bone: ${boneName}`);
        return;
      }
      
      failCount++;
      failedTracks.push(`${track.name} (bone not found: ${boneName})`);
      return;
    }

    // Check if we should strip hips position
    if (options.stripHipsPosition && boneName === 'hips' && track.name.endsWith('.position')) {
      console.log(`[retargetAnimationClip] Stripping hips position track: ${track.name}`);
      return;
    }

    // Get the actual scene path
    const nodePath = getNodePath(boneNode, vrm.scene);
    if (!nodePath) {
      failCount++;
      failedTracks.push(`${track.name} (no scene path for: ${boneName})`);
      return;
    }

    // Extract the property (.quaternion, .position, etc)
    const propertyMatch = track.name.match(/\.(quaternion|position|scale)$/);
    const property = propertyMatch ? propertyMatch[0] : '.quaternion';

    // Create new track with correct path
    const newTrackName = `${nodePath}${property}`;
    
    let newTrack: THREE.KeyframeTrack;
    if (track instanceof THREE.QuaternionKeyframeTrack) {
      newTrack = new THREE.QuaternionKeyframeTrack(
        newTrackName,
        Array.from(track.times),
        Array.from(track.values)
      );
    } else if (track instanceof THREE.VectorKeyframeTrack) {
      newTrack = new THREE.VectorKeyframeTrack(
        newTrackName,
        Array.from(track.times),
        Array.from(track.values)
      );
    } else {
      newTrack = new THREE.NumberKeyframeTrack(
        newTrackName,
        Array.from(track.times),
        Array.from(track.values)
      );
    }

    retargetedTracks.push(newTrack);
    successCount++;
  });

  console.log(`[retargetAnimationClip] Retargeted ${successCount} tracks, ${failCount} failed for "${clip.name}"`);
  
  if (failedTracks.length > 0) {
    console.warn('[retargetAnimationClip] Failed tracks:', failedTracks);
  }
  
  if (successCount === 0 && clip.tracks.length > 0) {
    console.error('[retargetAnimationClip] WARNING: No tracks were successfully retargeted! Animation may not play.');
  }

  return new THREE.AnimationClip(clip.name, clip.duration, retargetedTracks);
}

/**
 * Check if serialized animation data is valid
 */
export function isValidAnimationData(data: any): data is SerializedAnimationClip {
  return (
    data &&
    typeof data.name === 'string' &&
    typeof data.duration === 'number' &&
    Array.isArray(data.tracks) &&
    data.tracks.every((track: any) =>
      typeof track.name === 'string' &&
      typeof track.type === 'string' &&
      Array.isArray(track.times) &&
      Array.isArray(track.values)
    )
  );
}

