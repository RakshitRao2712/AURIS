package com.example.Auris.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Auris.Model.PdfDocument;

public interface PdfRepository extends JpaRepository<PdfDocument, Long> {
    PdfDocument findTopByUserEmailOrderByIdDesc(String email);
    }
