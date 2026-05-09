import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Users, Shield, MessageSquare, FileText } from 'lucide-react';

interface SegurIndicators {
  periode: {
    debut: string;
    fin: string;
  };
  patients_had_france_total: number;
  patients_avec_ins_qualifiee: number;
  taux_ins_qualifie_pct: number;
  connexions_psc_total: number;
  connexions_password_total: number;
  taux_connexions_psc_pct: number;
  messages_mssante_envoyes: number;
  messages_mssante_recus: number;
  depots_mes_reussis: number;
  depots_mes_echoues: number;
  taux_depot_mes_reussite_pct: number;
  cr_fin_had_valides: number;
  cr_fin_had_deposes_dmp: number;
  taux_depot_cr_pct: number;
}

interface ChartData {
  month: string;
  patients: number;
  taux_ins: number;
  connexions: number;
  messages: number;
  depots: number;
}

export default function SegurIndicators() {
  const [indicators, setIndicators] = useState<SegurIndicators | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchIndicators();
  }, [selectedPeriod]);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/segur/indicateurs?debut=${selectedPeriod.debut}&fin=${selectedPeriod.fin}`);
      const data = await response.json();
      setIndicators(data);
      
      // Générer des données factices pour le graphique (à remplacer par de vraies données)
      const mockChartData: ChartData[] = [
        { month: 'Jan', patients: 120, taux_ins: 85, connexions: 45, messages: 23, depots: 18 },
        { month: 'Fév', patients: 125, taux_ins: 87, connexions: 52, messages: 28, depots: 22 },
        { month: 'Mar', patients: 130, taux_ins: 89, connexions: 48, messages: 31, depots: 25 },
        { month: 'Avr', patients: 128, taux_ins: 88, connexions: 55, messages: 29, depots: 24 },
        { month: 'Mai', patients: 135, taux_ins: 91, connexions: 58, messages: 35, depots: 28 },
        { month: 'Juin', patients: 140, taux_ins: 92, connexions: 62, messages: 38, depots: 32 },
      ];
      setChartData(mockChartData);
    } catch (error) {
      console.error('Erreur lors de la récupération des indicateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let debut: Date;
    let fin: Date;

    switch (period) {
      case 'current':
        debut = new Date(now.getFullYear(), now.getMonth(), 1);
        fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'previous':
        debut = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        fin = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'year':
        debut = new Date(now.getFullYear(), 0, 1);
        fin = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setSelectedPeriod({
      debut: debut.toISOString().split('T')[0],
      fin: fin.toISOString().split('T')[0],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!indicators) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          Erreur lors du chargement des indicateurs Ségur.
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title="Indicateurs Ségur" />
      
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord Ségur</h1>
          <div className="flex items-center gap-4">
            <Select onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mois en cours</SelectItem>
                <SelectItem value="previous">Mois précédent</SelectItem>
                <SelectItem value="year">Année en cours</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-600">
              {new Date(indicators.periode.debut).toLocaleDateString('fr-FR')} - {new Date(indicators.periode.fin).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients HAD</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{indicators.patients_had_france_total}</div>
              <p className="text-xs text-muted-foreground">
                {indicators.patients_avec_ins_qualifiee} avec INS qualifiée ({indicators.taux_ins_qualifie_pct}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connexions PSC</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{indicators.connexions_psc_total}</div>
              <p className="text-xs text-muted-foreground">
                {indicators.taux_connexions_psc_pct}% des connexions totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages MSSanté</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{indicators.messages_mssante_envoyes + indicators.messages_mssante_recus}</div>
              <p className="text-xs text-muted-foreground">
                {indicators.messages_mssante_envoyes} envoyés, {indicators.messages_mssante_recus} reçus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CR HAD Déposés</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{indicators.cr_fin_had_deposes_dmp}</div>
              <p className="text-xs text-muted-foreground">
                {indicators.taux_depot_cr_pct}% des CR validés déposés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphique d'évolution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Évolution sur 6 mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="#8884d8" name="Patients" />
                <Line type="monotone" dataKey="taux_ins" stroke="#82ca9d" name="Taux INS (%)" />
                <Line type="monotone" dataKey="connexions" stroke="#ffc658" name="Connexions" />
                <Line type="monotone" dataKey="messages" stroke="#ff7c7c" name="Messages" />
                <Line type="monotone" dataKey="depots" stroke="#8dd1e1" name="Dépôts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle>Détail des indicateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicateur</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Patients HAD France</TableCell>
                  <TableCell>{indicators.patients_had_france_total}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Badge variant="secondary">Total</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Patients avec INS qualifiée</TableCell>
                  <TableCell>{indicators.patients_avec_ins_qualifiee}</TableCell>
                  <TableCell>{indicators.taux_ins_qualifie_pct}%</TableCell>
                  <TableCell>
                    <Badge variant={indicators.taux_ins_qualifie_pct >= 80 ? 'default' : 'destructive'}>
                      {indicators.taux_ins_qualifie_pct >= 80 ? 'Bon' : 'À améliorer'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Connexions PSC</TableCell>
                  <TableCell>{indicators.connexions_psc_total}</TableCell>
                  <TableCell>{indicators.taux_connexions_psc_pct}%</TableCell>
                  <TableCell>
                    <Badge variant={indicators.taux_connexions_psc_pct >= 50 ? 'default' : 'destructive'}>
                      {indicators.taux_connexions_psc_pct >= 50 ? 'Bon' : 'À améliorer'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Messages MSSanté envoyés</TableCell>
                  <TableCell>{indicators.messages_mssante_envoyes}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Badge variant="secondary">Total</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dépôts MES réussis</TableCell>
                  <TableCell>{indicators.depots_mes_reussis}</TableCell>
                  <TableCell>{indicators.taux_depot_mes_reussite_pct}%</TableCell>
                  <TableCell>
                    <Badge variant={indicators.taux_depot_mes_reussite_pct >= 90 ? 'default' : 'destructive'}>
                      {indicators.taux_depot_mes_reussite_pct >= 90 ? 'Excellent' : 'À améliorer'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CR fin HAD validés</TableCell>
                  <TableCell>{indicators.cr_fin_had_valides}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Badge variant="secondary">Total</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CR fin HAD déposés DMP</TableCell>
                  <TableCell>{indicators.cr_fin_had_deposes_dmp}</TableCell>
                  <TableCell>{indicators.taux_depot_cr_pct}%</TableCell>
                  <TableCell>
                    <Badge variant={indicators.taux_depot_cr_pct >= 85 ? 'default' : 'destructive'}>
                      {indicators.taux_depot_cr_pct >= 85 ? 'Bon' : 'À améliorer'}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
