import LegalLayout from '../../components/legal/LegalLayout';
import { Bullet, Link, Paragraph, SectionTitle, SubHeading } from '../../components/legal/LegalText';

const SUPPORT_X_URL = 'https://x.com/jaejoolee_kr';

export default function PrivacyPolicyScreen() {
  return (
    <LegalLayout title="Privacy Policy">
      <SectionTitle>1. Who We Are</SectionTitle>
      <Paragraph>VibeScene is operated by the VibeScene team, based in South Korea.</Paragraph>
      <Paragraph>
        If you have questions about this Privacy Policy or want to exercise your privacy
        rights, send us a DM on X at{' '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link>.
      </Paragraph>

      <SectionTitle>2. Information We Collect</SectionTitle>

      <SubHeading>Uploaded images</SubHeading>
      <Bullet>Photos you choose to upload</Bullet>
      <Bullet>Limited file metadata</Bullet>
      <Paragraph>Purpose: generate playlist recommendations</Paragraph>
      <Paragraph>Retention: deleted within 7 days</Paragraph>

      <SubHeading>Playlist results</SubHeading>
      <Bullet>Playlist title</Bullet>
      <Bullet>Curation caption/subtitle</Bullet>
      <Bullet>Selected lane</Bullet>
      <Bullet>Recommended tracks</Bullet>
      <Bullet>YouTube video IDs</Bullet>
      <Bullet>Playlist links</Bullet>
      <Paragraph>Purpose: show your result, history, and shared playlist pages</Paragraph>
      <Paragraph>
        Retention: until deleted by you, account deletion, or deletion request
      </Paragraph>

      <SubHeading>Account data</SubHeading>
      <Bullet>Anonymous user ID</Bullet>
      <Bullet>Google account ID, email, profile info if provided</Bullet>
      <Paragraph>Purpose: sign-in, account continuity, YouTube save where applicable</Paragraph>
      <Paragraph>Retention: until account deletion or disconnect</Paragraph>

      <SubHeading>YouTube authorization data</SubHeading>
      <Bullet>Access tokens</Bullet>
      <Bullet>Refresh tokens</Bullet>
      <Bullet>YouTube playlist ID/link where applicable</Bullet>
      <Paragraph>Purpose: create playlists when the user chooses to save to YouTube</Paragraph>
      <Paragraph>Retention: until disconnect, account deletion, or deletion request</Paragraph>

      <SubHeading>Technical data</SubHeading>
      <Bullet>Device/browser info</Bullet>
      <Bullet>Logs</Bullet>
      <Bullet>Error data</Bullet>
      <Bullet>Request time</Bullet>
      <Paragraph>Purpose: security, debugging, abuse prevention, reliability</Paragraph>
      <Paragraph>Retention: as needed for service operation</Paragraph>

      <SectionTitle>3. How We Use Information</SectionTitle>
      <Bullet>Provide playlist generation</Bullet>
      <Bullet>Analyze image mood/scene</Bullet>
      <Bullet>Show result/history</Bullet>
      <Bullet>Create shared playlist links</Bullet>
      <Bullet>Enable YouTube-related features when chosen</Bullet>
      <Bullet>Debug and secure the service</Bullet>
      <Bullet>Prevent abuse</Bullet>
      <Bullet>Communicate support</Bullet>

      <SectionTitle>4. Uploaded Images and Playlist Results</SectionTitle>
      <Paragraph>
        Original uploaded images are kept only for the short period needed to generate and
        display playlist results. We delete original uploaded images within 7 days.
      </Paragraph>
      <Paragraph>
        Playlist result data is stored separately from the original image and may include
        playlist title, curation caption/subtitle, selected lane, recommended tracks, YouTube
        video IDs, YouTube playlist link, and creation date.
      </Paragraph>
      <Paragraph>
        Playlist result data may be kept until the user deletes it, deletes their account, or
        requests deletion.
      </Paragraph>
      <Paragraph>
        We do not use uploaded images to identify people, recognize faces, infer sensitive
        traits, or train our own AI models.
      </Paragraph>

      <SectionTitle>5. Shared Playlist Links</SectionTitle>
      <Paragraph>
        If you create a share link, anyone with the link may view the shared playlist page.
      </Paragraph>
      <Paragraph>
        The shared page may include the uploaded photo, playlist title, curation
        caption/subtitle, recommended tracks, YouTube video IDs/links, and creation/share date.
      </Paragraph>
      <Paragraph>
        You should not create share links for photos you do not want others to see.
      </Paragraph>
      <Paragraph>
        Future deletion/unsharing controls may be added later. For now, send us a DM on X at{' '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link> for deletion requests.
      </Paragraph>

      <SectionTitle>6. AI and Automated Recommendations</SectionTitle>
      <Bullet>VibeScene uses automated image analysis to generate music recommendations.</Bullet>
      <Bullet>
        The system may consider colors, lighting, scene type, objects, atmosphere, and overall
        mood.
      </Bullet>
      <Bullet>
        It matches the image to a music lane and selects tracks from VibeScene's curated
        catalog.
      </Bullet>
      <Bullet>Recommendations are for entertainment purposes only.</Bullet>
      <Bullet>
        They do not produce legal, financial, employment, credit, or similarly significant
        effects.
      </Bullet>

      <SectionTitle>7. Google and YouTube API Services</SectionTitle>
      <Bullet>VibeScene uses YouTube API Services when users choose YouTube-related features.</Bullet>
      <Bullet>VibeScene only uses YouTube access to create playlists when the user chooses to save.</Bullet>
      <Bullet>VibeScene does not use YouTube data for advertising targeting.</Bullet>
      <Bullet>VibeScene does not sell YouTube data.</Bullet>
      <Bullet>
        By using YouTube-related features, you are also subject to the YouTube Terms of Service
        and Google Privacy Policy.
      </Bullet>
      <Bullet>You can revoke VibeScene's access from your Google Account security settings.</Bullet>

      <SectionTitle>8. Legal Bases for Processing</SectionTitle>
      <Paragraph>
        Where required by applicable law, we rely on one or more of the following legal bases
        to process your information:
      </Paragraph>
      <Bullet>Performance of a service</Bullet>
      <Bullet>Consent</Bullet>
      <Bullet>Legitimate interests</Bullet>
      <Bullet>Legal obligations</Bullet>

      <SectionTitle>9. How We Share Information</SectionTitle>
      <Paragraph>We work with service providers to operate VibeScene, including:</Paragraph>
      <Bullet>Supabase</Bullet>
      <Bullet>OpenAI or other AI service providers</Bullet>
      <Bullet>Google / YouTube</Bullet>
      <Bullet>Vercel / hosting providers</Bullet>
      <Bullet>Analytics or logging providers, if used</Bullet>
      <Paragraph>We do not sell personal information.</Paragraph>
      <Paragraph>
        We do not share personal information for cross-context behavioral advertising.
      </Paragraph>
      <Paragraph>We may disclose information if required by law or to protect the service.</Paragraph>

      <SectionTitle>10. No Sale or Sharing for Behavioral Advertising</SectionTitle>
      <Paragraph>We do not sell your personal information.</Paragraph>
      <Paragraph>
        We do not share your personal information for cross-context behavioral advertising as
        those terms are defined under California privacy law.
      </Paragraph>
      <Paragraph>We do not use uploaded images or YouTube data for ad targeting.</Paragraph>

      <SectionTitle>11. U.S. State Privacy Rights</SectionTitle>
      <Paragraph>Depending on where you live, you may have rights to:</Paragraph>
      <Bullet>Know/access the personal information we hold about you</Bullet>
      <Bullet>Delete your personal information</Bullet>
      <Bullet>Correct inaccurate personal information</Bullet>
      <Bullet>Opt out of sale or sharing, where applicable</Bullet>
      <Bullet>Non-discrimination for exercising your rights</Bullet>
      <Paragraph>
        VibeScene does not sell or share personal information for cross-context behavioral
        advertising.
      </Paragraph>
      <Paragraph>
        {'To exercise your rights, send us a DM on X at '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link>.
      </Paragraph>

      <SectionTitle>12. EEA and UK Privacy Rights</SectionTitle>
      <Paragraph>If you are located in the EEA or the UK, you may have rights to:</Paragraph>
      <Bullet>Access your personal data</Bullet>
      <Bullet>Correct your personal data</Bullet>
      <Bullet>Delete your personal data</Bullet>
      <Bullet>Restrict or object to processing</Bullet>
      <Bullet>Data portability</Bullet>
      <Bullet>Withdraw consent</Bullet>
      <Bullet>Lodge a complaint with your local data protection authority</Bullet>

      <SectionTitle>13. Children</SectionTitle>
      <Paragraph>
        VibeScene is not directed to children under 13, and we do not knowingly collect
        personal information from children under 13. If we learn we have collected personal
        information from a child under 13, we will take steps to delete it.
      </Paragraph>

      <SectionTitle>14. International Transfers</SectionTitle>
      <Paragraph>
        VibeScene may process information in countries other than where you live. This may
        include the United States and other countries where our service providers operate.
        Where required by applicable law, appropriate safeguards may be used for these
        transfers.
      </Paragraph>

      <SectionTitle>15. Security</SectionTitle>
      <Paragraph>We use reasonable technical and organizational measures, including:</Paragraph>
      <Bullet>Access controls</Bullet>
      <Bullet>Limited internal access</Bullet>
      <Bullet>Encrypted transmission where supported</Bullet>
      <Bullet>Logging for abuse prevention</Bullet>
      <Bullet>Deletion/anonymization after retention periods</Bullet>
      <Paragraph>No online service can guarantee perfect security.</Paragraph>

      <SectionTitle>16. Your Choices and Deletion Requests</SectionTitle>
      <Bullet>
        {'Send us a DM on X at '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link>
        {' to request deletion'}
      </Bullet>
      <Bullet>Revoke Google access from your Google Account settings</Bullet>
      <Bullet>Delete your account/data where available</Bullet>
      <Bullet>Send us a DM on X for shared link deletion requests</Bullet>

      <SectionTitle>17. Changes to This Policy</SectionTitle>
      <Paragraph>
        We may update this Privacy Policy from time to time. If we make changes, we will
        update the effective date above.
      </Paragraph>

      <SectionTitle>18. Contact</SectionTitle>
      <Paragraph>
        {'Send us a DM on X: '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link>
      </Paragraph>
    </LegalLayout>
  );
}
