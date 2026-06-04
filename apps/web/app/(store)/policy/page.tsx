"use client";

import { useState, useEffect, useRef } from "react";

const sections = {
  shipping: {
    label: "Vận Chuyển",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    ),
    tag: "Shipping",
    title: "Giao hàng tận nơi — nhanh & an toàn",
    content: [
      {
        heading: "Phạm vi & Hình thức",
        items: [
          { strong: "Khu vực:", text: "Giao hàng toàn quốc trên toàn lãnh thổ Việt Nam." },
          { strong: "Bánh kem & Đồ ngọt dễ vỡ:", text: "Giao bằng đội shipper riêng hoặc xe ô tô, đảm bảo không rung lắc, không nghiêng đổ." },
          { strong: "Socola & Bánh kẹo đóng gói:", text: "Giao hỏa tốc trong túi giữ nhiệt chuyên dụng." },
        ],
      },
      {
        heading: "Thời gian xử lý",
        items: [
          { strong: "Bánh kẹo có sẵn:", text: "2–4 giờ sau khi xác nhận (trong giờ làm việc)." },
          { strong: "Bánh kem thiết kế riêng:", text: "Đặt trước ít nhất 24–48 giờ." },
          { strong: "Giờ giao:", text: "8:00–20:00 tất cả các ngày trong tuần." },
        ],
      },
      {
        heading: "Phí vận chuyển",
        items: [
          { strong: "Nội thành:", text: "15.000 VNĐ" },
          { strong: "Ngoại thành:", text: "30.000 VNĐ" },
          { strong: "Freeship:", text: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên." },
        ],
      },
      {
        heading: "Nhận hàng & Kiểm tra",
        highlight: true,
        items: [
          { strong: "Quan trọng:", text: "Vui lòng mở hộp và kiểm tra hình thức bánh ngay khi nhận từ shipper." },
          { strong: "Hư hỏng do vận chuyển:", text: "Từ chối nhận và báo ngay Hotline để được đổi sản phẩm mới. Không giải quyết khiếu nại sau khi shipper rời đi." },
          { strong: "Bảo quản sau nhận:", text: "Để ngay vào ngăn mát tủ lạnh để giữ chất lượng tốt nhất." },
        ],
      },
    ],
  },
  returns: {
    label: "Đổi Trả",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    ),
    tag: "Returns",
    title: "Chính sách đổi trả minh bạch & công bằng",
    content: [
      {
        heading: "Quy định chung",
        items: [
          { strong: "Vệ sinh & An toàn:", text: "Không chấp nhận trả lại sản phẩm đã mở bao bì hoặc phá vỡ niêm phong trong bất kỳ trường hợp nào." },
          { strong: "Sản phẩm tùy chỉnh:", text: "Bánh kem đặt theo yêu cầu riêng hoặc gói quà mix riêng không được đổi trả hoặc hoàn tiền." },
          { strong: "Sở thích cá nhân:", text: "Không giải quyết hoàn tiền vì lý do không hợp khẩu vị (quá ngọt, không thích vị, v.v.)." },
        ],
      },
      {
        heading: "Trả hàng (bưu kiện chưa mở)",
        items: [
          { strong: "Thời hạn liên hệ:", text: "Trong vòng 24 giờ kể từ khi nhận hàng, qua email hoặc Zalo." },
          { strong: "Thời hạn gửi trả:", text: "Trong vòng 3 ngày kể từ ngày nhận tại cửa hàng TP.HCM." },
          { strong: "Phí vận chuyển:", text: "Khách hàng chịu hoàn toàn, Choco Kingdom không hỗ trợ." },
        ],
      },
      {
        heading: "Hủy đơn hàng",
        items: [
          { strong: "Thời gian hủy:", text: "Chỉ trong vòng 1 giờ kể từ khi đặt hàng." },
          { strong: "Bánh kem đặt trước:", text: "Không thể hủy nếu đã bắt đầu quy trình làm bánh hoặc trang trí." },
          { strong: "Phí giao dịch:", text: "Tất cả đơn hủy/trả bị trừ 10% phí giao dịch không hoàn lại." },
          { strong: "Phí vận chuyển:", text: "Không hoàn lại nếu đơn hàng đã xuất kho." },
        ],
      },
      {
        heading: "Xử lý sự cố",
        highlight: true,
        items: [
          { strong: "Hư hỏng do vận chuyển:", text: "Chụp ảnh/quay video và báo ngay cho shipper/cửa hàng để được đổi sản phẩm mới." },
          { strong: "Thời hạn hoàn tiền:", text: "7–14 ngày làm việc sau khi xác nhận hoàn tiền theo quy trình ngân hàng." },
        ],
      },
    ],
  },
  privacy: {
    label: "Bảo Mật",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    tag: "Privacy",
    title: "Dữ liệu của bạn — được bảo vệ tuyệt đối",
    content: [
      {
        heading: "Thông tin chúng tôi thu thập",
        items: [
          { strong: "Thông tin thiết bị:", text: "Trình duyệt, địa chỉ IP, múi giờ, cookie, log files, web pixels — nhằm tối ưu trải nghiệm website." },
          { strong: "Thông tin đơn hàng:", text: "Họ tên, địa chỉ giao hàng, thông tin thanh toán, email, số điện thoại — để xử lý đơn hàng của bạn." },
        ],
      },
      {
        heading: "Cách chúng tôi sử dụng",
        items: [
          { text: "Xử lý thanh toán và sắp xếp vận chuyển." },
          { text: "Cung cấp hóa đơn và xác nhận đơn hàng." },
          { text: "Liên lạc cập nhật trạng thái đơn hàng hoặc xử lý sự cố." },
          { text: "Cải thiện website qua số liệu phân tích (Google Analytics)." },
        ],
      },
      {
        heading: "Chia sẻ dữ liệu",
        items: [
          { strong: "Bên thứ ba:", text: "Chỉ với đơn vị vận hành website và Google Analytics để phục vụ hoạt động." },
          { strong: "Pháp luật:", text: "Có thể chia sẻ theo yêu cầu hợp pháp từ cơ quan nhà nước." },
          { strong: "Cam kết:", text: "Không bao giờ bán dữ liệu của bạn cho bên thứ ba vì mục đích thương mại." },
        ],
      },
      {
        heading: "Quyền của bạn",
        highlight: true,
        items: [
          { text: "Theo quy định pháp luật Việt Nam, bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân. Liên hệ với chúng tôi bất kỳ lúc nào để thực hiện quyền này." },
        ],
      },
    ],
  },
  faq: {
    label: "Hỏi & Đáp",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    ),
    tag: "FAQ",
    title: "Những câu hỏi thường gặp nhất",
    faqs: [
      { q: "Sản phẩm hết hàng có được nhập về lại không?", a: "Có! Theo dõi Fanpage Facebook/Instagram hoặc đăng ký nhận thông báo email để cập nhật hàng mới sớm nhất." },
      { q: "Làm thế nào để đặt hàng?", a: "Chọn sản phẩm → Thêm vào giỏ hàng → Nhập thông tin giao hàng tại TP.HCM → Chọn thanh toán. Đơn giản và nhanh chóng." },
      { q: "Choco Kingdom chấp nhận thanh toán nào?", a: "Chuyển khoản QR Code, Paypal và COD (áp dụng cho bánh kẹo có sẵn, không áp dụng bánh kem thiết kế riêng giá trị cao)." },
      { q: "Tôi có thể thay đổi đơn hàng sau khi đặt không?", a: "Liên hệ ngay qua Hotline/Zalo. Lưu ý: với bánh kem đã vào quy trình đóng gói hoặc giao hàng, việc thay đổi có thể không thực hiện được." },
      { q: "Gặp vấn đề với đơn hàng (thiếu/sai/hư), phải làm gì?", a: "Liên hệ trong vòng 2 ngày kể từ nhận hàng, kèm hình ảnh/video mở hộp và hóa đơn. Chúng tôi cam kết giải quyết tận tình." },
      { q: "Các gói bánh kẹo mix có luôn giống nhau không?", a: "Thành phần có thể thay đổi theo hàng tồn kho. Nếu một loại hết, chúng tôi thay thế bằng loại tương đương để đảm bảo gói hàng đầy đặn." },
    ],
  },
};

const contactInfo = [
  { icon: <PhoneIcon />, label: "Hotline / Zalo", value: "............." },
  { icon: <MailIcon />, label: "Email", value: "contact@chocokindom.com" },
  { icon: <InstagramIcon />, label: "Facebook / Instagram", value: "Choco Kingdom" },
];

/* ── Inline SVG icons ── */
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

/* ── Styles object ── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#FAF7F2",
    color: "#2C1810",
    overflowX: "hidden",
  },
  hero: {
    background: "#2C1810",
    padding: "5rem 4vw 4rem",
    position: "relative",
    overflow: "hidden",
  },
  heroDeco: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    border: "1px solid rgba(200,149,88,0.1)",
    pointerEvents: "none",
  },
  heroDeco2: {
    position: "absolute",
    top: "40px",
    right: "40px",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    border: "1px solid rgba(200,149,88,0.07)",
    pointerEvents: "none",
  },
  heroInner: { position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" },
  heroTag: {
    color: "#C89558",
    letterSpacing: ".35em",
    fontSize: "10px",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "1.25rem",
    fontWeight: 500,
  },
  heroH1: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "clamp(2.8rem, 7vw, 5rem)",
    fontWeight: 900,
    color: "#FAF7F2",
    lineHeight: 0.95,
    letterSpacing: "-.02em",
    marginBottom: ".6rem",
  },
  heroEm: { color: "#C89558", fontStyle: "italic" },
  heroSub: {
    color: "rgba(250,247,242,.45)",
    fontSize: ".9rem",
    maxWidth: "420px",
    lineHeight: 1.8,
    fontWeight: 300,
    marginTop: "1rem",
  },
  heroChips: { display: "flex", gap: ".5rem", marginTop: "1.75rem", flexWrap: "wrap" },
  chip: {
    background: "rgba(200,149,88,.12)",
    border: "1px solid rgba(200,149,88,.25)",
    color: "#C89558",
    fontSize: ".6rem",
    letterSpacing: ".2em",
    textTransform: "uppercase",
    padding: ".3rem .85rem",
    borderRadius: "2px",
    fontWeight: 500,
  },
  main: { padding: "5rem 4vw 7rem" },
  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "4rem",
    maxWidth: "1200px",
    margin: "0 auto",
    alignItems: "start",
  },
  sidebar: { position: "sticky", top: "2rem" },
  sidebarLabel: {
    fontSize: ".58rem",
    letterSpacing: ".4em",
    color: "#C89558",
    textTransform: "uppercase",
    marginBottom: "1rem",
    fontWeight: 500,
  },
  navList: { display: "flex", flexDirection: "column", gap: ".4rem" },
  navBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: ".7rem",
    padding: ".9rem 1.25rem",
    border: `1px solid ${active ? "#2C1810" : "transparent"}`,
    borderRadius: "2px",
    cursor: "pointer",
    background: active ? "#2C1810" : "transparent",
    color: active ? "#FAF7F2" : "rgba(44,24,16,.45)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: ".72rem",
    letterSpacing: ".08em",
    textTransform: "uppercase",
    fontWeight: 500,
    textAlign: "left",
    width: "100%",
    transition: "all .2s",
  }),
  navIcon: (active) => ({
    color: active ? "#C89558" : "rgba(44,24,16,.3)",
    display: "flex",
    alignItems: "center",
    minWidth: "18px",
  }),
  contactBox: {
    marginTop: "2rem",
    padding: "1.25rem",
    border: "1px solid #E8D5C0",
    borderRadius: "2px",
    background: "#FAF0E4",
  },
  contactLabel: {
    fontSize: ".55rem",
    letterSpacing: ".35em",
    color: "#C89558",
    textTransform: "uppercase",
    marginBottom: ".9rem",
    fontWeight: 500,
  },
  contactRow: { display: "flex", gap: ".5rem", alignItems: "flex-start", marginBottom: ".6rem" },
  contactIco: { color: "#C89558", marginTop: ".1em", flexShrink: 0 },
  contactRowLabel: { fontSize: ".58rem", color: "rgba(44,24,16,.45)", letterSpacing: ".1em", textTransform: "uppercase" },
  contactRowVal: { fontSize: ".78rem", color: "#2C1810", fontWeight: 500 },
  secTag: {
    color: "#C89558",
    fontSize: ".6rem",
    letterSpacing: ".4em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: ".6rem",
    fontWeight: 500,
  },
  secTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: "2.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "2px solid #2C1810",
  },
  block: { borderTop: "1px solid #E8D5C0", padding: "1.5rem 0" },
  blockTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: ".6rem",
  },
  badge: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#C89558",
    color: "#2C1810",
    fontSize: ".5rem",
    letterSpacing: ".2em",
    textTransform: "uppercase",
    padding: ".15rem .45rem",
    fontWeight: 600,
  },
  highlightWrap: {
    background: "#FAF0E4",
    padding: "1.25rem 1.5rem",
    borderLeft: "3px solid #C89558",
  },
  item: {
    display: "flex",
    gap: ".5rem",
    marginBottom: ".6rem",
    fontSize: ".88rem",
    lineHeight: 1.7,
    fontWeight: 300,
    alignItems: "flex-start",
  },
  itemDot: { color: "#C89558", flexShrink: 0, marginTop: ".2em", fontSize: ".65rem" },
  itemStrong: { fontWeight: 600, color: "#2C1810" },
  itemText: { color: "rgba(44,24,16,.65)" },
  faqItem: { borderBottom: "1px solid #E8D5C0" },
  faqQ: {
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "1.25rem 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: ".75rem",
    fontFamily: "'Playfair Display', serif",
    fontSize: ".95rem",
    fontWeight: 700,
    color: "#2C1810",
  },
  faqIcon: (open) => ({
    color: "#C89558",
    fontSize: "1.3rem",
    transition: "transform .3s",
    transform: open ? "rotate(45deg)" : "none",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 300,
    lineHeight: 1,
  }),
  faqA: (open) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: ".85rem",
    color: "rgba(44,24,16,.65)",
    lineHeight: 1.85,
    fontWeight: 300,
    maxHeight: open ? "200px" : 0,
    overflow: "hidden",
    transition: "max-height .4s ease, padding .3s",
    paddingBottom: open ? "1.25rem" : 0,
  }),
  cta: {
    background: "#F5EDE0",
    padding: "5rem 4vw",
    borderTop: "1px solid #E8D5C0",
    textAlign: "center",
  },
  ctaTag: {
    color: "#C89558",
    fontSize: ".6rem",
    letterSpacing: ".4em",
    textTransform: "uppercase",
    marginBottom: ".9rem",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  ctaH: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)",
    fontWeight: 700,
    marginBottom: "2.5rem",
    lineHeight: 1.25,
  },
  ctaEm: { color: "#A0522D", fontStyle: "italic" },
  btnRow: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" },
};

/* ── Main component ── */
export default function PolicyPage() {
  const [active, setActive] = useState("shipping");
  const [openFaq, setOpenFaq] = useState(null);
  const [visible, setVisible] = useState({});
  const [navHover, setNavHover] = useState(null);
  const refs = useRef({});

  useEffect(() => {
    const obs = {};
    Object.entries(refs.current).forEach(([k, el]) => {
      if (!el) return;
      obs[k] = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setVisible((v) => ({ ...v, [k]: true })); },
        { threshold: 0.1 }
      );
      obs[k].observe(el);
    });
    return () => Object.values(obs).forEach((o) => o.disconnect());
  }, [active]);

  const setRef = (k) => (el) => { refs.current[k] = el; };
  const cur = sections[active];

  const handleTabChange = (key) => {
    setActive(key);
    setVisible({});
    setOpenFaq(null);
  };

  const fadeStyle = (key, delay = 0) => ({
    opacity: visible[key] ? 1 : 0,
    transform: visible[key] ? "translateY(0)" : "translateY(28px)",
    transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 900px) {
          .ck-layout { grid-template-columns: 1fr !important; }
          .ck-sidebar { position: static !important; }
          .ck-nav { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
        }
      `}</style>

      <div style={S.page}>

        {/* ── HERO ── */}
        <section style={S.hero}>
          <div style={S.heroDeco} />
          <div style={S.heroDeco2} />
          <div style={S.heroInner}>
            <span style={S.heroTag}>Choco Kingdom / Chính sách dịch vụ</span>
            <h1 style={S.heroH1}>
              Quy định &amp;<br />
              <em style={S.heroEm}>Chính sách</em>
            </h1>
            <p style={S.heroSub}>
              Minh bạch là nền tảng của niềm tin. Mọi quy trình tại Choco Kingdom
              đều được thiết kế để bảo vệ quyền lợi tối đa cho bạn.
            </p>
            <div style={S.heroChips}>
              {["Giao hàng HCM", "Đổi trả minh bạch", "Bảo mật tuyệt đối"].map((c) => (
                <span key={c} style={S.chip}>{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN ── */}
        <section style={S.main}>
          <div className="ck-layout" style={S.layout}>

            {/* Sidebar */}
            <div className="ck-sidebar" style={S.sidebar}>
              <p style={S.sidebarLabel}>Danh mục</p>
              <nav className="ck-nav" style={S.navList}>
                {Object.entries(sections).map(([key, sec]) => {
                  const isActive = active === key;
                  const isHover = navHover === key;
                  return (
                    <button
                      key={key}
                      style={{
                        ...S.navBtn(isActive),
                        ...(isHover && !isActive
                          ? { borderColor: "#E8D5C0", color: "#2C1810", background: "#FAF0E4" }
                          : {}),
                      }}
                      onClick={() => handleTabChange(key)}
                      onMouseEnter={() => setNavHover(key)}
                      onMouseLeave={() => setNavHover(null)}
                    >
                      <span style={S.navIcon(isActive)}>{sec.icon}</span>
                      {sec.label}
                    </button>
                  );
                })}
              </nav>

              {/* Contact box */}
              <div style={S.contactBox}>
                <p style={S.contactLabel}>Liên hệ</p>
                {contactInfo.map((c, i) => (
                  <div key={i} style={S.contactRow}>
                    <span style={S.contactIco}>{c.icon}</span>
                    <div>
                      <div style={S.contactRowLabel}>{c.label}</div>
                      <div style={S.contactRowVal}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              {/* Header */}
              <div ref={setRef("head")} style={fadeStyle("head")}>
                <span style={S.secTag}>{cur.tag}</span>
                <h2 style={S.secTitle}>{cur.title}</h2>
              </div>

              {/* Content blocks */}
              {cur.content &&
                cur.content.map((block, bi) => (
                  <div
                    key={bi}
                    ref={setRef(`block${bi}`)}
                    style={{ ...S.block, ...fadeStyle(`block${bi}`, (bi % 3) * 0.1) }}
                  >
                    <h3 style={S.blockTitle}>
                      {block.heading}
                      {block.highlight && <span style={S.badge}>Quan trọng</span>}
                    </h3>
                    <div style={block.highlight ? S.highlightWrap : {}}>
                      {block.items.map((item, ii) => (
                        <div key={ii} style={S.item}>
                          <span style={S.itemDot}>◆</span>
                          <span>
                            {item.strong && (
                              <strong style={S.itemStrong}>{item.strong} </strong>
                            )}
                            {item.text && <span style={S.itemText}>{item.text}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {/* FAQ */}
              {cur.faqs && (
                <div ref={setRef("faqs")} style={fadeStyle("faqs")}>
                  {cur.faqs.map((faq, fi) => (
                    <div key={fi} style={S.faqItem}>
                      <button
                        style={S.faqQ}
                        onClick={() => setOpenFaq(openFaq === fi ? null : fi)}
                      >
                        <span>{faq.q}</span>
                        <span style={S.faqIcon(openFaq === fi)}>+</span>
                      </button>
                      <div style={S.faqA(openFaq === fi)}>{faq.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={S.cta}>
          <p style={S.ctaTag}>Còn thắc mắc?</p>
          <h2 style={S.ctaH}>
            Chúng tôi luôn sẵn sàng{" "}
            <em style={S.ctaEm}>lắng nghe</em>
          </h2>
          <div style={S.btnRow}>
            <CtaButton href="tel:+84901234567" variant="outline">
              Hotline / Zalo
            </CtaButton>
            <CtaButton href="mailto:contact@chocokindom.com" variant="fill">
              Gửi Email
            </CtaButton>
          </div>
        </section>
      </div>
    </>
  );
}

/* ── CTA Button ── */
function CtaButton({ href, variant, children }) {
  const [hover, setHover] = useState(false);
  const base = {
    display: "inline-block",
    padding: "1rem 2.5rem",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: ".72rem",
    letterSpacing: ".2em",
    textTransform: "uppercase",
    textDecoration: "none",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .25s",
  };
  const styles =
    variant === "outline"
      ? {
          ...base,
          border: "1px solid #2C1810",
          color: hover ? "#FAF7F2" : "#2C1810",
          background: hover ? "#2C1810" : "transparent",
        }
      : {
          ...base,
          background: "#C89558",
          color: "#FAF7F2",
          border: "none",
        };

  return (
    <a
      href={href}
      style={styles}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </a>
  );
}
