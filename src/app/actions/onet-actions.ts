'use server';

import { buildONetProfile } from '@/lib/onet-profile-builder';
import type { ONetProfile } from '@/types/domain';

export async function getONetProfileAction(socCode: string): Promise<ONetProfile> {
  return buildONetProfile(socCode);
}
