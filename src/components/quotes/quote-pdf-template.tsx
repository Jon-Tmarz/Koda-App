import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Quote } from '@/lib/quotes-service';
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser';

// Registramos la familia de fuentes Montserrat con sus variantes
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: '/fonts/Montserrat-Regular.ttf' }, // Regular
    { src: '/fonts/Montserrat-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/Montserrat-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.5,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerInfo: {
    textAlign: 'right',
  },
  logo: {
    width: 120,
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quoteInfo: {
    fontSize: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 5,
    marginBottom: 10,
    marginTop: 15,
  },
  content: {
    fontSize: 11,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 15,
  },
  tableRow: {
    flexDirection: "row"
  },
  tableColHeader: {
    backgroundColor: '#f3f4f6',
    padding: 5,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontWeight: 'bold',
  },
  tableCol: {
    padding: 5,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  colDesc: { width: '55%' },
  colHoras: { width: '15%', textAlign: 'right' },
  colCosto: { width: '15%', textAlign: 'right' },
  colSubtotal: { width: '15%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  totalLabel: {
    width: '85%',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '15%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

// Opciones para parsear el HTML del editor de texto
const htmlParserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode.type === 'tag') {
      switch (domNode.name) {
        case 'p':
          return <Text style={{ marginBottom: 10 }}>{domToReact(domNode.children, htmlParserOptions)}</Text>;
        case 'strong':
        case 'b':
          return <Text style={{ fontWeight: 'bold' }}>{domToReact(domNode.children, htmlParserOptions)}</Text>;
        case 'em':
        case 'i':
          return <Text style={{ fontStyle: 'italic' }}>{domToReact(domNode.children, htmlParserOptions)}</Text>;
        case 'ul':
          return <View style={{ marginLeft: 15, marginBottom: 10 }}>{domToReact(domNode.children, htmlParserOptions)}</View>;
        case 'ol':
          return <View style={{ marginLeft: 15, marginBottom: 10 }}>{domToReact(domNode.children, htmlParserOptions)}</View>;
        case 'li':
          return <Text style={{ marginBottom: 5 }}>• {domToReact(domNode.children, htmlParserOptions)}</Text>;
      }
    }
  },
};

export const QuotePDFTemplate = ({ quote, logoUrl }: { quote: Quote, logoUrl?: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {logoUrl && <Image style={styles.logo} src={logoUrl} />}
        <View style={styles.headerInfo}>
          <Text style={styles.quoteTitle}>Cotización {quote.numero}</Text>
          <Text>Fecha: {new Date(quote.fecha).toLocaleDateString('es-CO')}</Text>
        </View>
      </View>

      <View style={styles.quoteInfo}>
        <Text>Proyecto: {quote.titulo}</Text>
        <Text>Cliente: {quote.clienteNombre}</Text>
      </View>

      {quote.contenido && (
        <View>
          <Text style={styles.sectionTitle}>Detalles del Proyecto</Text>
          <View style={styles.content}>{parse(quote.contenido, htmlParserOptions)}</View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Items de la Cotización</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, styles.colDesc]}>Descripción</Text>
          <Text style={[styles.tableColHeader, styles.colHoras]}>Horas</Text>
          <Text style={[styles.tableColHeader, styles.colCosto]}>Costo/Hora</Text>
          <Text style={[styles.tableColHeader, styles.colSubtotal]}>Subtotal</Text>
        </View>
        {quote.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.colDesc]}>{item.descripcion}</Text>
            <Text style={[styles.tableCol, styles.colHoras]}>{item.horas}</Text>
            <Text style={[styles.tableCol, styles.colCosto]}>${item.costoPorHora.toLocaleString('es-CO')}</Text>
            <Text style={[styles.tableCol, styles.colSubtotal]}>${item.subtotal.toLocaleString('es-CO')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>${quote.subtotal.toLocaleString('es-CO')}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA (19%):</Text>
          <Text style={styles.totalValue}>${quote.iva.toLocaleString('es-CO')}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal, { marginTop: 10 }]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${quote.total.toLocaleString('es-CO')}</Text>
        </View>
      </View>
    </Page>
  </Document>
);