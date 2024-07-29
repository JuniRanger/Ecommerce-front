import React from 'react';
import styles from './Footer.module.css'; // Importa los estilos como módulo
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles['pie-pagina']}>
      <div className={styles['grupo-1']}>
        <div className={styles['box']}>
          <figure>
            <a href="#">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDhZoS2HT1QhlaHyYDp5JcpG-oTLbx88jDrA&s" alt="Logo de SLee Dw" />
            </a>
          </figure>
        </div>
        <div className={styles['box']}>
          <h2>Sobre Nosotros</h2>
          <p>En JuniLede, nos dedicamos a ofrecer productos de alta calidad para satisfacer tus necesidades
          Descubre una amplia gama de productos seleccionados especialmente para ti. Estamos aquí para ayudarte a encontrar lo que buscas.</p>
        </div>
        <div className={styles['box']}>
          <h2>Síguenos</h2>
          <div className={styles['red-social']}>
            <a href="#" className={styles['social-icon']} aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" className={styles['social-icon']} aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className={styles['social-icon']} aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className={styles['social-icon']} aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
      <div className={styles['grupo-2']}>
        <small>&copy; {new Date().getFullYear()} <b>JuniLede</b> - Todos los Derechos Reservados.</small>
      </div>
    </footer>
  );
};

export default Footer;
