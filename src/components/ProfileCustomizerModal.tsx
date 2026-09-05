"use client";

import React from "react";
import ProfileEditView, { ProfileEditViewProps } from "@/components/profile/ProfileEditView";

export default function ProfileCustomizerModal(props: ProfileEditViewProps) {
  if (!props.isOpen) return null;
  return <ProfileEditView isPage={false} {...props} />;
}
