'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, ChevronDown, CheckCircle, HelpCircle, Send } from 'lucide-react';

export default function ContactAndFaqPage() {
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Genel Destek');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // Dynamic Settings State
  const [contactData, setContactData] = useState({
    address: 'Kozyatağı Mahallesi, Bayar Caddesi, Plaza 34, Kat: 8, No: 12, Kadıköy / İstanbul, Türkiye',
    email: 'destek@seramikbak.com',
    phone: '0850 123 45 67',
    whatsapp: '+90 850 123 45 67'
  });

  const [faqs, setFaqs] = useState([
    {
      q: "SeramikBak üzerinden doğrudan ürün siparişi verebiliyor muyum?",
      a: "SeramikBak, doğrudan satış yapan bir e-ticaret sitesi değildir; bağımsız bir dijital showroom ve arama motorudur. Beğendiğiniz ürünlerin detay sayfasından 'En Yakın Bayiyi Bul' butonuna basarak bölgenizdeki yetkili satıcılardan (bayilerden) anında teklif isteyebilir veya iletişime geçerek satın alma işlemlerinizi yapabilirsiniz."
    },
    {
      q: "Nasıl numune (örnek ürün) talep edebilirim?",
      a: "Ürünlerin detay sayfasında bulunan 'Bayiden Bilgi Al' formu üzerinden bayilere numune talebinizi iletebilirsiniz. Bayiler stok durumuna göre adresinize kargo ile numune karo gönderebilir veya sizi showrooma davet edebilir."
    },
    {
      q: "Yetkili bayi olarak platforma nasıl kaydolabilirim?",
      a: "Sitemizin üst barında yer alan veya sayfa altındaki 'Bayi Portalı' linkine tıklayarak 'Yeni Bayi Başvurusu' yapabilirsiniz. Bilgileriniz onaylandıktan sonra paneliniz aktifleşecek ve bölgenizden gelen satın alma taleplerini almaya başlayabileceksiniz."
    },
    {
      q: "3D Sanal Stüdyo'da kendi odamın fotoğrafını kullanabilir miyim?",
      a: "Evet! 3D Sanal Stüdyo alanında yer alan 'Kendi Odamı Tasarla' (Görsel Yükle) özelliğini kullanarak banyo, mutfak veya salonunuzun fotoğrafını yükleyebilirsiniz. Akıllı yapay zeka algoritması zemin veya duvar alanlarını saniyeler içinde analiz eder ve seçtiğiniz karoları odanıza döşer."
    },
    {
      q: "Farklı markaların ürün fiyatları neden değişiklik göstermektedir?",
      a: "Fiyatlar markaların üretim teknolojileri, malzeme kalitesi (porselen, seramik, rektifiyeli olması), boyutları ve bayilerin bölgesel nakliye/lojistik maliyetlerine göre değişiklik göstermektedir. Platformumuzdaki en ucuz bayi tekliflerini karşılaştırarak bütçenize en uygun satıcıyı seçebilirsiniz."
    }
  ]);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.page_contact_content) {
            setContactData(data.page_contact_content);
          }
          if (data.page_faq_list) {
            setFaqs(data.page_faq_list);
          }
        }
      })
      .catch(err => console.error('Failed to load contact settings:', err));
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!kvkkAccepted) {
      alert('Lütfen KVKK Aydınlatma Metni\'ni okuyup onaylayınız.');
      return;
    }
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setKvkkAccepted(false);
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background radial accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(179, 142, 71, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Navbar Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#0f172a',
            fontSize: '0.85rem',
            fontWeight: '700',
            transition: 'color 0.2s'
          }} className="back-link-hover">
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#b38e47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1rem'
            }}>SB</div>
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>SeramikBak</span>
          </div>
        </div>
      </header>

      {/* Page Content Container */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 24px 100px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Intro */}
        <section style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
            fontWeight: '900',
            letterSpacing: '-0.025em',
            margin: '0 0 16px 0'
          }}>İletişim & Destek Merkezi</h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Sorularınız varsa Sıkça Sorulan Sorular rehberimizi okuyabilir veya aşağıdaki kanallardan destek ekibimize ulaşabilirsiniz.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {[
            {
              icon: <Phone size={20} />,
              title: 'Müşteri Hizmetleri',
              val: contactData.phone,
              link: `tel:${contactData.phone.replace(/\s+/g, '')}`,
              color: 'rgba(179, 142, 71, 0.08)',
              textCol: '#b38e47'
            },
            {
              icon: <MessageSquare size={20} />,
              title: 'WhatsApp Destek',
              val: contactData.whatsapp,
              link: `https://wa.me/${contactData.whatsapp.replace(/[^0-9]/g, '')}`,
              color: 'rgba(34, 197, 94, 0.08)',
              textCol: '#22c55e'
            },
            {
              icon: <Mail size={20} />,
              title: 'E-Posta Adresi',
              val: contactData.email,
              link: `mailto:${contactData.email}`,
              color: 'rgba(2, 132, 199, 0.08)',
              textCol: '#0284c7'
            }
          ].map((info, idx) => (
            <a key={idx} href={info.link} target={info.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textDecoration: 'none',
              color: '#0f172a',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} className="info-card-hover">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: info.color,
                color: info.textCol,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>{info.icon}</div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>{info.title}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{info.val}</div>
              </div>
            </a>
          ))}
        </section>

        {/* Contact Form + Map Representation */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          {/* Form */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 24px 0' }}>Bize Mesaj Gönderin</h3>
            
            {submitSuccess ? (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: '#16a34a'
              }}>
                <CheckCircle size={36} style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', fontWeight: '800' }}>Mesajınız İletildi!</h4>
                <p style={{ fontSize: '0.85rem', color: '#15803d', margin: 0 }}>
                  Destek ekibimiz mesajınızı inceleyip en kısa sürede e-posta adresiniz üzerinden geri dönüş sağlayacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Adınız Soyadınız</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder="Ahmet Yılmaz" 
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Telefon Numaranız</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="0555 123 4567" 
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>E-Posta Adresiniz</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="ahmet@example.com" 
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Konu Başlığı</label>
                  <select 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="Genel Destek">Genel Destek / Soru</option>
                    <option value="Bayilik Talebi">B2B Bayi Kaydı Hakkında</option>
                    <option value="Marka İş Ortaklığı">Marka İş Ortaklığı / SaaS</option>
                    <option value="Teknik Sorun">3D Stüdyo / Teknik Hata Raporu</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Mesajınız</label>
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    required 
                    rows={4} 
                    placeholder="Nasıl yardımcı olabiliriz..." 
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', marginBottom: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="kvkk-check" 
                    checked={kvkkAccepted} 
                    onChange={(e) => setKvkkAccepted(e.target.checked)} 
                    required
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="kvkk-check" style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" style={{ color: '#b38e47', fontWeight: '600', textDecoration: 'underline' }}>KVKK Aydınlatma Metni'ni</Link> okudum ve kabul ediyorum.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Map and Office Address */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 16px 0' }}>Merkez Ofisimiz</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', color: '#475569', fontSize: '0.9rem' }}>
                <MapPin size={20} style={{ color: '#b38e47', flexShrink: 0 }} />
                <div>
                  <strong>SeramikBak Teknoloji A.Ş.</strong>
                  <p style={{ margin: '4px 0 0 0', lineHeight: '1.5' }}>
                    {contactData.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Stylized Modern Vector Map mockup */}
            <div style={{
              width: '100%',
              height: '220px',
              background: '#f1f5f9',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Map grid representation */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px',
                opacity: 0.7
              }} />
              
              {/* Stylized Road lines */}
              <div style={{ position: 'absolute', width: '100%', height: '4px', background: '#e2e8f0', transform: 'rotate(10deg)', top: '80px' }} />
              <div style={{ position: 'absolute', width: '100%', height: '4px', background: '#e2e8f0', transform: 'rotate(-25deg)', top: '130px' }} />
              <div style={{ position: 'absolute', height: '100%', width: '4px', background: '#e2e8f0', left: '120px' }} />

              {/* Marker pin */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                transform: 'translateY(-10px)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#0f172a',
                  color: '#b38e47',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '0.8rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  border: '2px solid #ffffff'
                }}>SB</div>
                <div style={{
                  width: '0',
                  height: '0',
                  borderStyle: 'solid',
                  borderWidth: '8px 6px 0 6px',
                  borderColor: '#0f172a transparent transparent transparent'
                }} />
                <div style={{
                  width: '12px',
                  height: '4px',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '50%',
                  marginTop: '2px',
                  filter: 'blur(1px)'
                }} />
              </div>
              
              <span style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(255,255,255,0.9)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '600',
                color: '#64748b',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>📌 Kadıköy, İstanbul</span>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section style={{
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <HelpCircle size={24} style={{ color: '#b38e47' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Sıkça Sorulan Sorular (SSS)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} style={{
                  borderBottom: idx === faqs.length - 1 ? 'none' : '1px solid #f1f5f9',
                  paddingBottom: idx === faqs.length - 1 ? 0 : '16px'
                }}>
                  <div 
                    onClick={() => toggleFaq(idx)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      padding: '8px 0'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: isOpen ? '#b38e47' : '#0f172a', transition: 'color 0.2s' }}>
                      {faq.q}
                    </span>
                    <ChevronDown size={16} style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: isOpen ? '#b38e47' : '#64748b',
                      flexShrink: 0
                    }} />
                  </div>
                  
                  {isOpen && (
                    <div style={{
                      marginTop: '10px',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      color: '#475569',
                      paddingRight: '20px',
                      animation: 'faqSlide 0.25s ease-out'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <style jsx global>{`
        .back-link-hover:hover {
          color: #b38e47 !important;
          transform: translateX(-3px);
        }
        .info-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03) !important;
        }
        @keyframes faqSlide {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
