import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import './Support.css';

const Support = () => {
  useEffect(() => {
    // Add floating animation to cards
    const cards = document.querySelectorAll('.support-section, .support-card');
    cards.forEach((card, index) => {
      card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });
  }, []);

  const supportData = [
    {
      title: 'Whatsapp',
      items: [
        {
          label: 'WhatsApp Channel',
          value: 'https://whatsapp.com/channel/0029VbCDKoL5kg73qAweji3L',
          icon: 'fab fa-whatsapp'
        },
        {
          label: 'WhatsApp Number',
          value: 'Facebook page helpline',
          icon: 'fas fa-phone'
        }
      ]
    },
    {
      title: 'Phone',
      items: [
        {
          label: 'Support Call',
          value: 'Facebook page helpline',
          icon: 'fas fa-headset'
        }
      ]
    },
    {
      title: 'Telegram',
      items: [
        {
          label: 'Telegram Channel',
          value: 'https://t.me/licrownpvt',
          icon: 'fab fa-telegram-plane'
        }
      ]
    }
  ];

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text);
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };

  return (
    <Layout title="Support">
      {/* Header */}
      <div className="mb-5">
        <h4 className="text-white fw-bold mb-2">Help & Support</h4>
        <p className="text-gray">Choose your support level and connect with us</p>
      </div>

      {/* Support Sections */}
      {supportData.map((section, sectionIndex) => (
        <div key={sectionIndex} className="support-section">
          <h5 className="support-title">{section.title}</h5>
          
          {section.items.map((item, itemIndex) => (
            <div key={itemIndex} className="support-card">
              <div className="d-flex align-items-center">
                <div className="support-icon">
                  <i className={item.icon}></i>
                </div>
                <div className="support-info">
                  <p className="support-label">{item.label}</p>
                  <p className="support-value">{item.value}</p>
                </div>
              </div>
              <button className="copy-btn" onClick={() => copyToClipboard(item.value)}>
                <i className="far fa-copy"></i>
              </button>
            </div>
          ))}
        </div>
      ))}
    </Layout>
  );
};

export default Support;
