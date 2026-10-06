package data

import (
	"bytes"
	"encoding/json"
	"os"
	"testing"
	"time"
)

func TestDatasets(t *testing.T) {
	for _, name := range []string{"MY-2026.json", "MY-2027.json", "SG-2026.json", "SG-2027.json"} {
		b, err := datasets.ReadFile(name)
		if err != nil {
			t.Fatal(err)
		}
		var set struct {
			Status  string
			Records []struct {
				Name, Date, SourceURL, VerificationDate string
				States                                  []string
			}
		}
		if json.Unmarshal(b, &set) != nil {
			t.Fatal("bad JSON")
		}
		for _, r := range set.Records {
			if _, err := time.Parse("2006-01-02", r.Date); err != nil {
				t.Fatal(err)
			}
			if r.SourceURL == "" || r.VerificationDate == "" {
				t.Fatal("missing verification")
			}
		}
		web, err := os.ReadFile("../frontend/public/holidays/" + name)
		if err != nil || !bytes.Equal(b, web) {
			t.Fatal("frontend and backend holiday data differ")
		}
		if name == "MY-2027.json" || name == "MY-2026.json" {
			expected := 49
			if name == "MY-2027.json" {
				expected = 50
			}
			if set.Status != "verified-schedule" || len(set.Records) != expected {
				t.Fatal("missing verified holidays")
			}
			found := map[string]bool{}
			for _, r := range set.Records {
				if len(r.States) == 0 {
					t.Fatal("missing state applicability")
				}
				if r.Name == "Sultan of Selangor’s Birthday" && r.Date[5:] == "12-11" && len(r.States) == 1 && r.States[0] == "SGR" {
					found["selangor"] = true
				}
				if r.Name == "Sultan of Johor’s Birthday" && r.Date[5:] == "03-23" && len(r.States) == 1 && r.States[0] == "JHR" {
					found["johor"] = true
				}
				if r.Name == "Awal Muharam" && len(r.States) == 16 {
					found["muharam"] = true
				}
			}
			if len(found) != 3 {
				t.Fatal("missing key state or national holidays")
			}
		}
	}
}
