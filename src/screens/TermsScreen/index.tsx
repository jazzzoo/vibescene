import LegalLayout from '../../components/legal/LegalLayout';
import { Bullet, Link, Paragraph, SectionTitle } from '../../components/legal/LegalText';

const SUPPORT_X_URL = 'https://x.com/jaejoolee_kr';

export default function TermsScreen() {
  return (
    <LegalLayout title="Terms of Service">
      <SectionTitle>1. Acceptance of Terms</SectionTitle>
      <Paragraph>
        By using VibeScene, you agree to these Terms of Service. If you do not agree, please
        do not use the app.
      </Paragraph>

      <SectionTitle>2. What VibeScene Does</SectionTitle>
      <Paragraph>
        VibeScene lets you upload a photo and receive a playlist that matches the photo's mood.
      </Paragraph>
      <Paragraph>
        Recommendations are generated using automated image analysis and VibeScene's curated
        music catalog.
      </Paragraph>

      <SectionTitle>3. Age Requirement</SectionTitle>
      <Paragraph>
        VibeScene is not intended for children under 13. By using VibeScene, you represent
        that you are at least 13 years old or have permission from a parent or guardian where
        required.
      </Paragraph>

      <SectionTitle>4. User Content and Uploads</SectionTitle>
      <Bullet>Only upload images you have the right to use.</Bullet>
      <Bullet>Do not upload illegal, harmful, abusive, private, or rights-infringing content.</Bullet>
      <Bullet>
        You grant VibeScene a limited license to process your uploaded images only to
        provide, secure, improve, and support the service.
      </Bullet>
      <Bullet>This license does not transfer ownership of your image.</Bullet>

      <SectionTitle>5. Shared Links</SectionTitle>
      <Bullet>
        When you create a share link, anyone with the link may view the shared playlist and
        photo.
      </Bullet>
      <Bullet>You are responsible for deciding what you share.</Bullet>
      <Bullet>Do not share sensitive or private images.</Bullet>
      <Bullet>
        {'Send us a DM on X at '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link>
        {' for deletion requests.'}
      </Bullet>

      <SectionTitle>6. YouTube and Third-Party Services</SectionTitle>
      <Bullet>
        YouTube-related features are subject to the YouTube Terms of Service and Google
        Privacy Policy.
      </Bullet>
      <Bullet>VibeScene does not own, host, download, or redistribute YouTube videos or audio.</Bullet>
      <Bullet>YouTube content availability may change.</Bullet>
      <Bullet>
        VibeScene is not responsible for YouTube availability, playback, removals, or other
        third-party content.
      </Bullet>

      <SectionTitle>7. Google / YouTube Account Connection</SectionTitle>
      <Bullet>
        If you connect your Google/YouTube account, you authorize VibeScene to perform the
        requested YouTube-related action.
      </Bullet>
      <Bullet>You can revoke access in your Google Account settings.</Bullet>
      <Bullet>VibeScene only uses YouTube access for user-requested features.</Bullet>

      <SectionTitle>8. Acceptable Use</SectionTitle>
      <Paragraph>You agree not to:</Paragraph>
      <Bullet>Use the service illegally</Bullet>
      <Bullet>Abuse or harass others</Bullet>
      <Bullet>Upload content that violates others' rights</Bullet>
      <Bullet>Attempt to reverse engineer or attack the service</Bullet>
      <Bullet>Scrape, automate, or send excessive requests</Bullet>
      <Bullet>Abuse API quotas</Bullet>
      <Bullet>Interfere with YouTube, Google, Supabase, OpenAI, or other third-party services</Bullet>
      <Bullet>Use the service to identify people or infer sensitive traits from images</Bullet>

      <SectionTitle>9. Usage Limits and Future Paid Features</SectionTitle>
      <Paragraph>
        We may apply usage limits, rate limits, credits, paid plans, or premium features in the
        future to manage API costs, service stability, abuse prevention, or third-party
        platform limits.
      </Paragraph>

      <SectionTitle>10. Beta / Experimental Service</SectionTitle>
      <Bullet>VibeScene may change, break, or be discontinued.</Bullet>
      <Bullet>Recommendations may be inaccurate, unavailable, incomplete, or unexpected.</Bullet>
      <Bullet>The service is provided for entertainment purposes.</Bullet>

      <SectionTitle>11. Intellectual Property</SectionTitle>
      <Paragraph>
        The VibeScene brand, interface, code, curated catalog, and service design belong to
        VibeScene or its licensors.
      </Paragraph>
      <Paragraph>You retain rights to your uploaded images.</Paragraph>
      <Paragraph>YouTube videos and audio belong to their respective owners.</Paragraph>

      <SectionTitle>12. Disclaimers</SectionTitle>
      <Bullet>The service is provided "as is" and "as available."</Bullet>
      <Bullet>We do not guarantee that recommendations will match your taste or image.</Bullet>
      <Bullet>We do not guarantee uninterrupted operation.</Bullet>

      <SectionTitle>13. Limitation of Liability</SectionTitle>
      <Paragraph>
        To the maximum extent permitted by applicable law, VibeScene and its team are not
        liable for indirect, incidental, or consequential damages arising from your use of the
        service. Our total liability for any claim relating to the service is limited to the
        greatest extent allowed by applicable law.
      </Paragraph>

      <SectionTitle>14. Termination</SectionTitle>
      <Paragraph>
        VibeScene may suspend or restrict access for abuse, policy violations, legal risk, or
        operational issues.
      </Paragraph>

      <SectionTitle>15. Changes to the Service or Terms</SectionTitle>
      <Paragraph>
        VibeScene may update these Terms and the service over time. If we make changes, we
        will update the effective date above.
      </Paragraph>

      <SectionTitle>16. Governing Law</SectionTitle>
      <Paragraph>
        These Terms are governed by the laws of South Korea, unless applicable consumer
        protection laws require otherwise.
      </Paragraph>

      <SectionTitle>17. Contact</SectionTitle>
      <Paragraph>
        {'Send us a DM on X: '}
        <Link href={SUPPORT_X_URL}>@jaejoolee_kr</Link>
      </Paragraph>
    </LegalLayout>
  );
}
