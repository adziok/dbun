```mermaid
 sequenceDiagram
  Klient --|> AplikacjaKlienta
  AplikacjaKlienta -->| SystemRezerwacji : (Zarezerwuj Taksówkę)
  AplikacjaKlienta -->| SystemRezerwacji : (Zarządzaj Rezerwacjami)
  AplikacjaKlienta -->| SystemPłatności : (Dokonaj Płatności)

  SystemRezerwacji -->| Kierowca : (Poinformuj Kierowcę)
  SystemRezerwacji --|> BazaDanych

  Kierowca -->| BazaDanych
  SystemPłatności -->| BazaDanych


```
