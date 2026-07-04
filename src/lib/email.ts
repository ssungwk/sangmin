export async function sendApprovalEmail(to: string, name: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: "RESEND_API_KEY가 설정되지 않아 이메일을 보내지 못했습니다." };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: "계정이 승인되었습니다",
      html: `<p>${name}님, 판매관리시스템 계정이 관리자 승인되었습니다.</p><p>이제 로그인하실 수 있습니다.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: `이메일 발송 실패: ${text}` };
  }

  return {};
}
